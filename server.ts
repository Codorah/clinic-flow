import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

// Initialize Prisma
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "clinic-super-secret";

// --- ASYNC WRAPPER ---
const asyncHandler = (fn: Function) => (req: any, res: any, next: any) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- JWT AUTH MIDDLEWARE ---
const authenticate = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentification requise" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
};

// --- ADMIN-ONLY MIDDLEWARE ---
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Accès réservé aux administrateurs" });
  }
  next();
};

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // --- PUBLIC ROUTES (no auth required) ---

  // Hospital Info — used on login page before auth
  app.get("/api/hospital", asyncHandler(async (req: any, res: any) => {
    const hospital = await prisma.hospital.findUnique({ where: { id: 1 } });
    res.json(hospital || { name: "Clinique de la Grâce" });
  }));

  // Auth: Admin Password Login
  app.post("/api/auth/admin-login", asyncHandler(async (req: any, res: any) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.role !== "admin") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const isValid = await bcrypt.compare(password, user.password || "");
    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName } });
  }));

  // Auth: Workstation PIN Login
  app.post("/api/auth/pin-login", asyncHandler(async (req: any, res: any) => {
    const { username, pin } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || user.pin !== pin) {
      return res.status(401).json({ error: "Invalid PIN" });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role, displayName: user.displayName } });
  }));

  // --- PROTECTED ROUTES (JWT required) ---

  // Update Hospital Info — admin only
  app.put("/api/hospital", authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
    const { name } = req.body;
    const hospital = await prisma.hospital.update({ where: { id: 1 }, data: { name } });
    res.json(hospital);
  }));

  // Stats — admin only
  app.get("/api/stats", authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
    const totalPatients = await prisma.patient.count();
    const treatments = await prisma.treatment.count();
    const invoices = await prisma.invoice.findMany({ where: { status: "paid" } });
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingInvoices = await prisma.invoice.count({ where: { status: "pending" } });
    res.json({ totalPatients, totalRevenue, activeTreatments: treatments, pendingInvoices });
  }));

  // Users — admin only
  app.get("/api/users", authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
    const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
    res.json(users);
  }));

  app.post("/api/users", authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
    const { username, pin, role, displayName, email, password } = req.body;
    const data: any = { username, pin, role, displayName, email };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.create({ data });
    res.json(user);
  }));

  app.delete("/api/users/:id", authenticate, requireAdmin, asyncHandler(async (req: any, res: any) => {
    // Prevent deleting the primary CEO account
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (target?.email === "ceo.codorah@gmail.com") {
      return res.status(403).json({ error: "Ce compte ne peut pas être supprimé" });
    }
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  }));

  // Catalog — all authenticated users
  app.get("/api/catalog", authenticate, asyncHandler(async (req: any, res: any) => {
    const items = await prisma.catalogItem.findMany();
    res.json(items);
  }));

  // Patients — all authenticated users
  app.get("/api/patients", authenticate, asyncHandler(async (req: any, res: any) => {
    const patients = await prisma.patient.findMany({
      include: { treatments: true, invoices: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(patients);
  }));

  // Create patient — reception or admin
  app.post("/api/patients", authenticate, asyncHandler(async (req: any, res: any) => {
    const allowed = ["reception", "admin"];
    if (!allowed.includes(req.user?.role)) {
      return res.status(403).json({ error: "Accès refusé" });
    }
    const patient = await prisma.patient.create({ data: req.body });
    res.json(patient);
  }));

  // Update patient — any authenticated user (workflow updates)
  app.put("/api/patients/:id", authenticate, asyncHandler(async (req: any, res: any) => {
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(patient);
  }));

  // Treatments — all authenticated users
  app.post("/api/treatments", authenticate, asyncHandler(async (req: any, res: any) => {
    const treatment = await prisma.treatment.create({ data: req.body });
    res.json(treatment);
  }));

  app.get("/api/treatments", authenticate, asyncHandler(async (req: any, res: any) => {
    const treatments = await prisma.treatment.findMany({
      include: { patient: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(treatments);
  }));

  // Invoices — all authenticated users can read; only cashier/admin can update
  app.post("/api/invoices", authenticate, asyncHandler(async (req: any, res: any) => {
    const invoice = await prisma.invoice.create({ data: req.body });
    res.json(invoice);
  }));

  app.get("/api/invoices", authenticate, asyncHandler(async (req: any, res: any) => {
    const invoices = await prisma.invoice.findMany({
      include: { patient: true },
      orderBy: { createdAt: "desc" }
    });
    res.json(invoices);
  }));

  app.put("/api/invoices/:id", authenticate, asyncHandler(async (req: any, res: any) => {
    const allowed = ["cashier", "admin", "accounting"];
    if (!allowed.includes(req.user?.role)) {
      return res.status(403).json({ error: "Accès réservé à la caisse ou à l'administration" });
    }
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(invoice);
  }));

  // --- GLOBAL ERROR HANDLER ---
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("Server Error:", err);
    res.status(500).json({ error: "Erreur serveur. Veuillez réessayer." });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: any, res: any) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
