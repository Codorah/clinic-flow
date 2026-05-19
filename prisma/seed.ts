import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // FIX — Vérification AVANT de seeder : si l'admin existe déjà, on ne recrée rien
  // Cela évite l'erreur "Unique constraint failed" et protège les données existantes
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "ceo.codorah@gmail.com" },
  });

  if (existingAdmin) {
    console.log("✅ Base de données déjà initialisée — seed ignoré.");
    return;
  }

  console.log("🌱 Initialisation de la base de données...");

  // Hôpital
  await prisma.hospital.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Clinique de la Grâce" },
  });

  // Compte Admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.create({
    data: {
      email: "ceo.codorah@gmail.com",
      password: hashedPassword,
      role: "admin",
      displayName: "Administrateur",
    },
  });

  // Postes de travail (PIN uniquement)
  const workstations = [
    { username: "reception",     pin: "1111", role: "reception",       displayName: "Réception" },
    { username: "docteur",       pin: "2222", role: "doctor",          displayName: "Consultation" },
    { username: "infirmerie",    pin: "3333", role: "nurse",           displayName: "Soins Infirmiers" },
    { username: "laboratoire",   pin: "4444", role: "laboratory",      displayName: "Laboratoire" },
    { username: "pharmacie",     pin: "5555", role: "pharmacy",        displayName: "Pharmacie" },
    { username: "comptabilite",  pin: "6666", role: "accounting",      displayName: "Comptabilité" },
    { username: "caisse",        pin: "7777", role: "cashier",         displayName: "Caisse" },
    { username: "hospitalisation",pin: "8888", role: "hospitalization", displayName: "Hospitalisation" },
  ];

  for (const ws of workstations) {
    await prisma.user.create({ data: ws });
  }

  console.log("✅ Seed terminé avec succès !");
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed :", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
