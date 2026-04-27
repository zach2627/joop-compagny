import { PrismaClient } from "@prisma/client";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();

const LEGACY_CLOUD_NAME = "dqcx2lewi";
const LEGACY_MARKER = `res.cloudinary.com/${LEGACY_CLOUD_NAME}/`;

type LegacyImageRecord = {
  model: string;
  field: string;
  id: string;
  url: string;
  label?: string | null;
  extra?: Record<string, string | null | undefined>;
};

function formatExtra(extra?: Record<string, string | null | undefined>) {
  if (!extra) return "";

  return Object.entries(extra)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${key}=${value}`)
    .join(" | ");
}

function matchesLegacyCloudinary(url: string | null | undefined) {
  return (url ?? "").includes(LEGACY_MARKER);
}

async function collectLegacyImageUrls(): Promise<LegacyImageRecord[]> {
  const records: LegacyImageRecord[] = [];

  const [users, categories, variants, productImages, orderItems, banners] = await Promise.all([
    prisma.user.findMany({
      where: {
        avatarUrl: {
          contains: LEGACY_CLOUD_NAME,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarUrl: true,
      },
    }),
    prisma.category.findMany({
      where: {
        imageUrl: {
          contains: LEGACY_CLOUD_NAME,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        slug: true,
        name: true,
        imageUrl: true,
      },
    }),
    prisma.productVariant.findMany({
      where: {
        imageUrl: {
          contains: LEGACY_CLOUD_NAME,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        sku: true,
        name: true,
        imageUrl: true,
        product: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
    }),
    prisma.productImage.findMany({
      where: {
        url: {
          contains: LEGACY_CLOUD_NAME,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        url: true,
        alt: true,
        color: true,
        isPrimary: true,
        sortOrder: true,
        product: {
          select: {
            slug: true,
            name: true,
          },
        },
      },
      orderBy: [{ productId: "asc" }, { sortOrder: "asc" }, { createdAt: "asc" }],
    }),
    prisma.orderItem.findMany({
      where: {
        imageUrl: {
          contains: LEGACY_CLOUD_NAME,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        orderId: true,
        order: {
          select: {
            orderNumber: true,
          },
        },
        productName: true,
        variantName: true,
        imageUrl: true,
      },
    }),
    prisma.banner.findMany({
      where: {
        imageUrl: {
          contains: LEGACY_CLOUD_NAME,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
        title: true,
        imageUrl: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  for (const user of users) {
    if (!matchesLegacyCloudinary(user.avatarUrl)) continue;
    records.push({
      model: "User",
      field: "avatarUrl",
      id: user.id,
      url: user.avatarUrl ?? "",
      label: user.name ?? user.email,
      extra: {
        email: user.email,
      },
    });
  }

  for (const category of categories) {
    if (!matchesLegacyCloudinary(category.imageUrl)) continue;
    records.push({
      model: "Category",
      field: "imageUrl",
      id: category.id,
      url: category.imageUrl ?? "",
      label: category.name,
      extra: {
        slug: category.slug,
      },
    });
  }

  for (const variant of variants) {
    if (!matchesLegacyCloudinary(variant.imageUrl)) continue;
    records.push({
      model: "ProductVariant",
      field: "imageUrl",
      id: variant.id,
      url: variant.imageUrl ?? "",
      label: variant.name,
      extra: {
        sku: variant.sku,
        product: variant.product.name,
        productSlug: variant.product.slug,
      },
    });
  }

  for (const productImage of productImages) {
    if (!matchesLegacyCloudinary(productImage.url)) continue;
    records.push({
      model: "ProductImage",
      field: "url",
      id: productImage.id,
      url: productImage.url,
      label: productImage.product.name,
      extra: {
        productSlug: productImage.product.slug,
        alt: productImage.alt,
        color: productImage.color,
        isPrimary: String(productImage.isPrimary),
        sortOrder: String(productImage.sortOrder),
      },
    });
  }

  for (const orderItem of orderItems) {
    if (!matchesLegacyCloudinary(orderItem.imageUrl)) continue;
    records.push({
      model: "OrderItem",
      field: "imageUrl",
      id: orderItem.id,
      url: orderItem.imageUrl ?? "",
      label: orderItem.productName,
      extra: {
        orderNumber: orderItem.order.orderNumber,
        variant: orderItem.variantName,
      },
    });
  }

  for (const banner of banners) {
    if (!matchesLegacyCloudinary(banner.imageUrl)) continue;
    records.push({
      model: "Banner",
      field: "imageUrl",
      id: banner.id,
      url: banner.imageUrl,
      label: banner.title,
    });
  }

  return records.sort((a, b) => {
    if (a.model !== b.model) return a.model.localeCompare(b.model);
    return a.id.localeCompare(b.id);
  });
}

async function main() {
  const records = await collectLegacyImageUrls();

  console.log("");
  console.log(`Legacy Cloudinary scan for "${LEGACY_CLOUD_NAME}"`);
  console.log(`Database: ${process.env.DATABASE_URL ? "configured" : "missing DATABASE_URL"}`);
  console.log(`Matches: ${records.length}`);
  console.log("");

  if (records.length === 0) {
    console.log("No image URL references found for the legacy Cloudinary account.");
    return;
  }

  const countsByModel = records.reduce<Record<string, number>>((acc, record) => {
    acc[record.model] = (acc[record.model] ?? 0) + 1;
    return acc;
  }, {});

  console.log("Counts by model:");
  for (const [model, count] of Object.entries(countsByModel).sort(([a], [b]) =>
    a.localeCompare(b)
  )) {
    console.log(`- ${model}: ${count}`);
  }

  console.log("");
  console.log("Records:");

  records.forEach((record, index) => {
    console.log(`[${index + 1}] ${record.model}.${record.field}`);
    console.log(`  id: ${record.id}`);
    if (record.label) console.log(`  label: ${record.label}`);
    const extra = formatExtra(record.extra);
    if (extra) console.log(`  meta: ${extra}`);
    console.log(`  url: ${record.url}`);
  });

  console.log("");
  console.log("JSON:");
  console.log(JSON.stringify(records, null, 2));
}

main()
  .catch((error) => {
    console.error("Legacy Cloudinary scan failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
