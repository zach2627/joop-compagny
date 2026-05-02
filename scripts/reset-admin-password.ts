import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();
const ADMIN_EMAIL = "admin@joop-compagny.com";

async function main() {
  const nextPassword = process.env.NEW_ADMIN_PASSWORD?.trim();

  if (!nextPassword) {
    throw new Error("NEW_ADMIN_PASSWORD is missing in .env");
  }

  const user = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  if (!user) {
    throw new Error(`Admin account not found: ${ADMIN_EMAIL}`);
  }

  const passwordHash = await bcrypt.hash(nextPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      isActive: true,
    },
  });

  console.log("");
  console.log("Admin password reset complete.");
  console.log(`Email: ${user.email}`);
  console.log(`Role: ${user.role}`);
  console.log(`Active: ${user.isActive ? "yes" : "no"}`);
  console.log("Password source: NEW_ADMIN_PASSWORD in .env");
  console.log("");
}

main()
  .catch((error) => {
    console.error("Admin password reset failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
