// prisma/list-products.ts
// Lists all products in the database with their slugs and image counts.
// Run: npx tsx prisma/list-products.ts

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany({
    include: { images: { select: { id: true, color: true, isPrimary: true } } },
    orderBy: { name: "asc" },
  });

  if (products.length === 0) {
    console.log("❌ No products found in the database.");
    return;
  }

  console.log(`Found ${products.length} product(s):\n`);
  console.log(
    "ID".padEnd(38) + "  " +
    "NAME".padEnd(40) + "  " +
    "SLUG".padEnd(36) + "  " +
    "IMAGES"
  );
  console.log("-".repeat(130));

  for (const p of products) {
    console.log(
      p.id.padEnd(38) + "  " +
      p.name.padEnd(40) + "  " +
      p.slug.padEnd(36) + "  " +
      `${p.images.length} img(s)`
    );
  }
}

main()
  .catch((e) => { console.error("❌ Error:", e); process.exit(1); })
  .finally(() => prisma.$disconnect());
