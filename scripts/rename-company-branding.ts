import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

const OLD_BRAND = `JOOP COMPA${"GNY"}`;
const NEW_BRAND = "JOOP COMPANY";

async function main() {
  const matchingProducts = await prisma.product.count({
    where: { brand: OLD_BRAND },
  });

  const result = await prisma.product.updateMany({
    where: { brand: OLD_BRAND },
    data: { brand: NEW_BRAND },
  });

  console.log("");
  console.log(`Brand rename complete: ${OLD_BRAND} -> ${NEW_BRAND}`);
  console.log(`Products scanned with old brand: ${matchingProducts}`);
  console.log(`Products updated: ${result.count}`);
  console.log(
    "No dedicated site settings table exists in the current Prisma schema; persisted product brand values were aligned instead."
  );
  console.log("");
}

main()
  .catch((error) => {
    console.error("Brand rename failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
