import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

const STORE_CATEGORY_FIXTURES = [
  {
    slug: "bijoux",
    name: "Bijoux",
    description: "Bracelets, colliers, parures, bagues",
    sortOrder: 1,
  },
  {
    slug: "montres",
    name: "Montres",
    description: "Montres dorees femme",
    sortOrder: 2,
  },
  {
    slug: "parfums",
    name: "Parfums",
    description: "Parfums d'orient",
    sortOrder: 3,
  },
  {
    slug: "encens",
    name: "Encens",
    description: "Thiouraye, encens rares",
    sortOrder: 4,
  },
  {
    slug: "coffrets",
    name: "Coffrets",
    description: "Cadeaux prets a offrir",
    sortOrder: 5,
  },
] as const;

function getPrimaryImageUrl(
  product: { images: Array<{ url: string }> } | null | undefined
) {
  return product?.images[0]?.url ?? null;
}

async function ensureStoreCategories() {
  const categories = await Promise.all(
    STORE_CATEGORY_FIXTURES.map((fixture) =>
      prisma.category.upsert({
        where: { slug: fixture.slug },
        update: {
          name: fixture.name,
          description: fixture.description,
          sortOrder: fixture.sortOrder,
          isActive: true,
          parentId: null,
        },
        create: {
          ...fixture,
          isActive: true,
        },
      })
    )
  );

  return new Map(categories.map((category) => [category.slug, category]));
}

async function moveWatchProductsToMontres(montresCategoryId: string) {
  const watchProducts = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: "montre", mode: "insensitive" } },
        { slug: { contains: "montre", mode: "insensitive" } },
        { tags: { hasSome: ["montre", "montres", "watch", "watches"] } },
      ],
    },
    select: {
      id: true,
      name: true,
      slug: true,
      categoryId: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const productsToMove = watchProducts.filter(
    (product) => product.categoryId !== montresCategoryId
  );

  for (const product of productsToMove) {
    await prisma.product.update({
      where: { id: product.id },
      data: { categoryId: montresCategoryId },
    });
  }

  return {
    scanned: watchProducts.length,
    moved: productsToMove.map((product) => ({
      id: product.id,
      slug: product.slug,
      from: product.category.slug,
      to: "montres",
    })),
  };
}

async function syncCategoryImages() {
  const results: Array<{ slug: string; imageUrl: string | null; productSlug: string | null }> = [];

  for (const fixture of STORE_CATEGORY_FIXTURES) {
    const category = await prisma.category.findUnique({
      where: { slug: fixture.slug },
      select: {
        id: true,
        slug: true,
        imageUrl: true,
        products: {
          where: { isActive: true },
          orderBy: { createdAt: "asc" },
          take: 1,
          select: {
            slug: true,
            images: {
              where: { isPrimary: true },
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              take: 1,
              select: { url: true },
            },
          },
        },
      },
    });

    if (!category) {
      results.push({ slug: fixture.slug, imageUrl: null, productSlug: null });
      continue;
    }

    const firstProduct = category.products[0] ?? null;
    const imageUrl = getPrimaryImageUrl(firstProduct);

    if (imageUrl && imageUrl !== category.imageUrl) {
      await prisma.category.update({
        where: { id: category.id },
        data: { imageUrl },
      });
    }

    results.push({
      slug: fixture.slug,
      imageUrl,
      productSlug: firstProduct?.slug ?? null,
    });
  }

  return results;
}

async function main() {
  const categories = await ensureStoreCategories();
  const montresCategory = categories.get("montres");

  if (!montresCategory) {
    throw new Error("Montres category could not be created or loaded.");
  }

  const watchFix = await moveWatchProductsToMontres(montresCategory.id);
  const categoryImages = await syncCategoryImages();

  console.log("");
  console.log("Homepage category data fix complete.");
  console.log(`Watch-like products scanned: ${watchFix.scanned}`);
  console.log(`Watch-like products moved: ${watchFix.moved.length}`);

  if (watchFix.moved.length > 0) {
    console.log("Moved products:");
    for (const product of watchFix.moved) {
      console.log(`- ${product.slug}: ${product.from} -> ${product.to}`);
    }
  }

  console.log("Category image sync:");
  for (const item of categoryImages) {
    console.log(
      `- ${item.slug}: product=${item.productSlug ?? "none"} image=${item.imageUrl ?? "none"}`
    );
  }
  console.log("");
}

main()
  .catch((error) => {
    console.error("Homepage category data fix failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
