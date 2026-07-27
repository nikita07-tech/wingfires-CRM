// Creates the lead-numbering sequence and your first admin login.
// Run this once after your first deploy: npm run seed
// (You'll set ADMIN_EMAIL / ADMIN_PASSWORD as env vars before running it —
// see the README for exact instructions.)

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.numberingSequence.upsert({
    where: { key: "lead" },
    update: {},
    create: { key: "lead", prefix: "LD", nextValue: 1, padding: 5 },
  });

  await prisma.numberingSequence.upsert({
    where: { key: "customer" },
    update: {},
    create: { key: "customer", prefix: "CUS", nextValue: 1, padding: 5 },
  });

  await prisma.numberingSequence.upsert({
    where: { key: "rfq" },
    update: {},
    create: { key: "rfq", prefix: "RFQ", nextValue: 1, padding: 5 },
  });

  await prisma.numberingSequence.upsert({
    where: { key: "quotation" },
    update: {},
    create: { key: "quotation", prefix: "QUO", nextValue: 1, padding: 5 },
  });

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.log("Skipping admin creation — set ADMIN_EMAIL and ADMIN_PASSWORD env vars to create one.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email, name: "Admin", passwordHash, role: "ADMIN" },
  });
  console.log(`Admin user ready: ${user.email}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
