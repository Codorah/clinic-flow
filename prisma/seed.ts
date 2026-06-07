import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Initialisation de la base de données...");

  await prisma.hospital.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, name: "Clinique de la Grâce" },
  });

  const hashedPassword = await bcrypt.hash("admin123", 10);
  await prisma.user.upsert({
    where: { email: "ceo.codorah@gmail.com" },
    update: { password: hashedPassword, role: "admin", displayName: "Administrateur" },
    create: { email: "ceo.codorah@gmail.com", password: hashedPassword, role: "admin", displayName: "Administrateur" },
  });

  // IMPORTANT: usernames must match the UserRole IDs sent by the frontend
  const workstations = [
    { username: "reception",       pin: "1111", role: "reception",       displayName: "Réception" },
    { username: "doctor",          pin: "2222", role: "doctor",          displayName: "Consultation" },
    { username: "nurse",           pin: "3333", role: "nurse",           displayName: "Soins Infirmiers" },
    { username: "lab",             pin: "4444", role: "lab",             displayName: "Laboratoire" },
    { username: "radiology",       pin: "9999", role: "radiology",       displayName: "Radiologie" },
    { username: "pharmacy",        pin: "5555", role: "pharmacy",        displayName: "Pharmacie" },
    { username: "accounting",      pin: "6666", role: "accounting",      displayName: "Comptabilité" },
    { username: "cashier",         pin: "7777", role: "cashier",         displayName: "Caisse" },
    { username: "hospitalization", pin: "8888", role: "hospitalization", displayName: "Hospitalisation" },
  ];

  for (const ws of workstations) {
    await prisma.user.upsert({
      where: { username: ws.username },
      update: { pin: ws.pin, role: ws.role, displayName: ws.displayName },
      create: ws,
    });
  }

  // Catalogue médical — indispensable pour les consultations
  const catalog = [
    { name: "Consultation Générale",       price: 5000,  category: "consultation" },
    { name: "Consultation Spécialisée",    price: 10000, category: "consultation" },
    { name: "Prise de Sang",               price: 3000,  category: "laboratoire"  },
    { name: "Analyse Urine",               price: 2500,  category: "laboratoire"  },
    { name: "NFS Complète",                price: 5000,  category: "laboratoire"  },
    { name: "Test Paludisme (TDR)",        price: 2000,  category: "laboratoire"  },
    { name: "Test Grossesse",              price: 1500,  category: "laboratoire"  },
    { name: "Glycémie",                    price: 1500,  category: "laboratoire"  },
    { name: "Radiographie Thorax",         price: 8000,  category: "radiologie"   },
    { name: "Échographie Abdominale",      price: 15000, category: "radiologie"   },
    { name: "Échographie Obstétricale",    price: 12000, category: "radiologie"   },
    { name: "Médicaments Génériques",      price: 2000,  category: "pharmacie"    },
    { name: "Perfusion IV (sans médic.)",  price: 5000,  category: "soins"        },
    { name: "Pansement Simple",            price: 1500,  category: "soins"        },
    { name: "Injection Intramusculaire",   price: 1000,  category: "soins"        },
    { name: "Hospitalisation (par nuit)", price: 15000, category: "hospitalisation"},
    { name: "Chirurgie Mineure",           price: 50000, category: "chirurgie"    },
  ];

  for (const item of catalog) {
    const existing = await prisma.catalogItem.findFirst({ where: { name: item.name } });
    if (!existing) {
      await prisma.catalogItem.create({ data: item });
    }
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
