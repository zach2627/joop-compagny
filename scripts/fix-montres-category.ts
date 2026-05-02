/**
 * Fix montres category assignment.
 *
 * Finds products likely to be watches (by name/slug keywords) and:
 * - Reassigns them to the "montres" category
 * - Marks them isActive + isFeatured so they appear in the homepage showcase
 *
 * Run: npx tsx scripts/fix-montres-category.ts
 */
import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

const WATCH_KEYWORDS = ["montre", "watch", "timepiece", "bracelet-montre", "horloge"];

function isWatchProduct(name: string, slug: string, tags: string[]) {
  const haystack = [name, slug, ...tags].join(" ").toLowerCase();
  return WATCH_KEYWORDS.some((kw) => haystack.includes(kw));
}

async function main() {
  const montresCategory = await prisma.category.findUnique({
    where: { slug: "montres" },
    select: { id: true, name: true },
  });

  if (!montresCategory) {
    console.error("❌ Catégorie 'montres' introuvable. Lance d'abord: npm run db:seed");
    process.exit(1);
  }
  console.log(`✓ Catégorie trouvée : ${montresCategory.name} (${montresCategory.id})`);

  // 1. Products already in montres category
  const existingMontres = await prisma.product.findMany({
    where: { categoryId: montresCategory.id },
    select: { id: true, name: true, slug: true, isFeatured: true, isActive: true },
  });
  console.log(`\n→ Produits déjà dans "montres" : ${existingMontres.length}`);
  existingMontres.forEach((p) => console.log(`  · ${p.name} (featured: ${p.isFeatured}, active: ${p.isActive})`));

  // 2. Find watch-like products in other categories
  const allProducts = await prisma.product.findMany({
    where: { categoryId: { not: montresCategory.id } },
    select: { id: true, name: true, slug: true, tags: true, category: { select: { slug: true } } },
  });

  const toReassign = allProducts.filter((p) => isWatchProduct(p.name, p.slug, p.tags));
  console.log(`\n→ Produits à réassigner vers "montres" : ${toReassign.length}`);

  if (toReassign.length > 0) {
    for (const p of toReassign) {
      await prisma.product.update({
        where: { id: p.id },
        data: { categoryId: montresCategory.id, isActive: true, isFeatured: true },
      });
      console.log(`  ✓ Réassigné : ${p.name} (était dans: ${p.category.slug})`);
    }
  }

  // 3. Ensure at least one featured+active product exists in montres
  const montresFeatured = await prisma.product.findFirst({
    where: { categoryId: montresCategory.id, isActive: true, isFeatured: true },
    select: { id: true, name: true },
  });

  if (!montresFeatured) {
    // Activate and feature the first available product in the category
    const firstProduct = await prisma.product.findFirst({
      where: { categoryId: montresCategory.id },
      select: { id: true, name: true },
    });
    if (firstProduct) {
      await prisma.product.update({
        where: { id: firstProduct.id },
        data: { isActive: true, isFeatured: true },
      });
      console.log(`\n  ✓ Marqué featured : ${firstProduct.name}`);
    } else {
      console.log("\n  ⚠️  Aucun produit dans 'montres'. Ajoute des produits puis relance.");
    }
  } else {
    console.log(`\n  ✓ Showcase montres : ${montresFeatured.name}`);
  }

  // 4. Summary: featured products per category
  const slugs = ["bijoux", "montres", "parfums", "encens", "coffrets"];
  console.log("\n── Résumé final ────────────────────────────────");
  for (const slug of slugs) {
    const cat = await prisma.category.findUnique({
      where: { slug },
      include: {
        _count: { select: { products: true } },
        products: {
          where: { isActive: true, isFeatured: true },
          take: 1,
          include: { images: { where: { isPrimary: true }, take: 1 } },
        },
      },
    });
    if (!cat) continue;
    const img = cat.products[0]?.images[0]?.url ?? "(pas d'image)";
    console.log(`  ${slug.padEnd(10)} ${cat._count.products} produit(s) — showcase: ${img}`);
  }

  console.log("\n✓ Terminé. Relance le serveur Next.js pour invalider le cache.");
}

main()
  .catch((err) => {
    console.error("❌ Erreur :", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
