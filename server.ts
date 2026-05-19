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

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());

  // --- API ROUTES ---

  // Auth: Admin Password Login
  app.post("/api/auth/admin-login", async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || user.role !== "admin") {
        return res.status(401).json({ error: "Unauthorized" });
      }
      
      const isValid = await bcrypt.compare(password, user.password || "");
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email, role: user.role, displayName: user.displayName } });
    } catch (e) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Auth: Workstation PIN Login
  app.post("/api/auth/pin-login", async (req, res) => {
    const { username, pin } = req.body;
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user || user.pin !== pin) {
        return res.status(401).json({ error: "Invalid PIN" });
      }

      const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
      res.json({ token, user: { id: user.id, username: user.username, role: user.role, displayName: user.displayName } });
    } catch (e) {
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Hospital Info
  app.get("/api/hospital", async (req, res) => {
    const hospital = await prisma.hospital.findUnique({ where: { id: 1 } });
    res.json(hospital || { name: "Clinic of Grace" });
  });

  // Update Hospital Info
  app.put("/api/hospital", async (req, res) => {
    const { name } = req.body;
    const hospital = await prisma.hospital.update({
      where: { id: 1 },
      data: { name }
    });
    res.json(hospital);
  });

  // Stats for Admin
  app.get("/api/stats", async (req, res) => {
    const totalPatients = await prisma.patient.count();
    const treatments = await prisma.treatment.count();
    const invoices = await prisma.invoice.findMany({ where: { status: 'paid' } });
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const pendingInvoices = await prisma.invoice.count({ where: { status: 'pending' } });

    res.json({
      totalPatients,
      totalRevenue,
      activeTreatments: treatments,
      pendingInvoices
    });
  });

  // Users Management
  app.get("/api/users", async (req, res) => {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  });

  app.post("/api/users", async (req, res) => {
    const { username, pin, role, displayName, email, password } = req.body;
    const data: any = { username, pin, role, displayName, email };
    if (password) {
      data.password = await bcrypt.hash(password, 10);
    }
    const user = await prisma.user.create({ data });
    res.json(user);
  });

  app.delete("/api/users/:id", async (req, res) => {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  });

  // Patients/Treatments/Invoices...
  // (Adding basic routes to make dashboards functional)

  app.get("/api/catalog", async (req, res) => {
    const items = await prisma.catalogItem.findMany();
    res.json(items);
  });

  app.get("/api/patients", async (req, res) => {
    const patients = await prisma.patient.findMany({ include: { treatments: true, invoices: true }, orderBy: { createdAt: 'desc' } });
    res.json(patients);
  });

  app.post("/api/patients", async (req, res) => {
    const patient = await prisma.patient.create({ data: req.body });
    res.json(patient);
  });

  app.put("/api/patients/:id", async (req, res) => {
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(patient);
  });

  app.post("/api/treatments", async (req, res) => {
    const treatment = await prisma.treatment.create({ data: req.body });
    res.json(treatment);
  });

  app.get("/api/treatments", async (req, res) => {
    const treatments = await prisma.treatment.findMany({ include: { patient: true }, orderBy: { createdAt: 'desc' } });
    res.json(treatments);
  });

  app.post("/api/invoices", async (req, res) => {
    const invoice = await prisma.invoice.create({ data: req.body });
    res.json(invoice);
  });

  app.get("/api/invoices", async (req, res) => {
    const invoices = await prisma.invoice.findMany({ include: { patient: true }, orderBy: { createdAt: 'desc' } });
    res.json(invoices);
  });

  app.put("/api/invoices/:id", async (req, res) => {
    const invoice = await prisma.invoice.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json(invoice);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
