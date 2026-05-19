import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Create Hospital
  await prisma.hospital.upsert({
    where: { id: 1 },
    update: { name: "Clinique de la Grâce" },
    create: { id: 1, name: "Clinique de la Grâce" },
  });

  // 2. Create Admin Users
  const adminPassword = await bcrypt.hash("admin123", 10);
  
  const admins = [
    { email: "ceo.codorah@gmail.com", username: "admin", displayName: "Administrateur CEO" },
    { email: "admin@codorah.com", username: "admin_general", displayName: "Administrateur Général" },
    { email: "test.admin@codorah.com", username: "admin_test", displayName: "Administrateur de Test" },
  ];

  for (const adm of admins) {
    await prisma.user.upsert({
      where: { email: adm.email },
      update: { password: adminPassword, displayName: adm.displayName },
      create: {
        email: adm.email,
        username: adm.username,
        password: adminPassword,
        displayName: adm.displayName,
        role: "admin",
      },
    });
  }

  // 3. Create Workstations with PINs
  const workstations = [
    { id: 'reception', label: 'Réception', pin: '1111' },
    { id: 'doctor', label: 'Consultation', pin: '2222' },
    { id: 'nurse', label: 'Infirmerie', pin: '3333' },
    { id: 'lab', label: 'Laboratoire', pin: '4444' },
    { id: 'pharmacy', label: 'Pharmacie', pin: '5555' },
    { id: 'accounting', label: 'Comptabilité', pin: '6666' },
    { id: 'cashier', label: 'Caisse', pin: '7777' },
    { id: 'hospitalization', label: 'Hospitalisation', pin: '8888' },
  ];

  for (const ws of workstations) {
    await prisma.user.upsert({
      where: { username: ws.id },
      update: { pin: ws.pin, displayName: ws.label, role: ws.id },
      create: {
        username: ws.id,
        pin: ws.pin,
        displayName: ws.label,
        role: ws.id,
      },
    });
  }

  // 4. Create Treatments Catalog (French)
  const catalog = [
    { name: 'Consultation Générale', price: 50, category: 'Général' },
    { name: 'Test Sanguin (NFS)', price: 120, category: 'Lab' },
    { name: 'Radiographie Thorax', price: 200, category: 'Radiologie' },
    { name: 'Traitement Paludisme', price: 150, category: 'Pharmacie' },
    { name: 'Extraction Dentaire', price: 300, category: 'Dentaire' },
    { name: 'Chirurgie Mineure', price: 1200, category: 'Chirurgie' },
    { name: 'Hospitalisation (Jour)', price: 450, category: 'Salles' },
  ];

  for (const item of catalog) {
    await prisma.catalogItem.create({ data: item });
  }

  // 5. Create Dummy Patients
  const patients = [
    { firstName: 'Jean', lastName: 'Dupont', phone: '0102030405', status: 'DISCHARGED', birthDate: new Date('1985-05-12') },
    { firstName: 'Marie', lastName: 'Curie', phone: '0607080910', status: 'NURSE_QUEUE', birthDate: new Date('1992-11-20') },
    { firstName: 'Paul', lastName: 'Valery', phone: '0708091011', status: 'RECEPTION', birthDate: new Date('1970-01-15') },
  ];

  for (const p of patients) {
    await prisma.patient.create({ data: p });
  }

  console.log("Seeding completed: Clinic of Grace is ready.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
