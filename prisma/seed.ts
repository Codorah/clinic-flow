import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initialisation de la base de données...");

  // Hôpital
  await prisma.hospital.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Clinique de la Grâce" },
  });

  // Compte Admin
  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "ceo.codorah@gmail.com" },
    update: {
      password: hashedPassword,
      role: "admin",
      displayName: "Administrateur",
    },
    create: {
      email: "ceo.codorah@gmail.com",
      password: hashedPassword,
      role: "admin",
      displayName: "Administrateur",
    },
  });

  // Postes de travail (PIN uniquement)
  // IMPORTANT: usernames must match the UserRole IDs sent by the frontend
  const workstations = [
    { username: "reception",       pin: "1111", role: "reception",       displayName: "Réception" },
    { username: "doctor",          pin: "2222", role: "doctor",          displayName: "Consultation" },
    { username: "nurse",           pin: "3333", role: "nurse",           displayName: "Soins Infirmiers" },
    { username: "lab",             pin: "4444", role: "lab",             displayName: "Laboratoire" },
    { username: "pharmacy",        pin: "5555", role: "pharmacy",        displayName: "Pharmacie" },
    { username: "accounting",      pin: "6666", role: "accounting",      displayName: "Comptabilité" },
    { username: "cashier",         pin: "7777", role: "cashier",         displayName: "Caisse" },
    { username: "hospitalization", pin: "8888", role: "hospitalization", displayName: "Hospitalisation" },
  ];

  for (const ws of workstations) {
    await prisma.user.upsert({
      where: { username: ws.username },
      update: {
        pin: ws.pin,
        role: ws.role,
        displayName: ws.displayName,
      },
      create: ws,
    });
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
