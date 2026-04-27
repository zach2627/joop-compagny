// prisma/audit-cloudinary-urls.ts
// Lists every DB record whose image URL still points to the old Cloudinary
// account (dqcx2lewi) so they can be migrated to the new account.
//
// Usage:
//   npx tsx prisma/audit-cloudinary-urls.ts
//   npx tsx prisma/audit-cloudinary-urls.ts --json   # machine-readable output

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const OLD_ACCOUNT = "dqcx2lewi";
const JSON_MODE = process.argv.includes("--json");

type Row = {
  table: string;
  id: string;
  label: string;
  field: string;
  url: string;
};

function containsOldAccount(url: string | null | undefined): boolean {
  return typeof url === "string" && url.includes(OLD_ACCOUNT);
}

async function main() {
  const rows: Row[] = [];

  // ── product_images ────────────────────────────────────────────────────────
  const productImages = await prisma.productImage.findMany({
    where: { url: { contains: OLD_ACCOUNT } },
    include: { product: { select: { name: true, slug: true } } },
  });
  for (const img of productImages) {
    rows.push({
      table: "product_images",
      id: img.id,
      label: `${img.product.name} (${img.product.slug})${img.isPrimary ? " [primary]" : ""}`,
      field: "url",
      url: img.url,
    });
  }

  // ── product_variants ──────────────────────────────────────────────────────
  const variants = await prisma.productVariant.findMany({
    where: { imageUrl: { contains: OLD_ACCOUNT } },
    include: { product: { select: { name: true, slug: true } } },
  });
  for (const v of variants) {
    if (!containsOldAccount(v.imageUrl)) continue;
    rows.push({
      table: "product_variants",
      id: v.id,
      label: `${v.product.name} / ${v.name} (SKU: ${v.sku})`,
      field: "imageUrl",
      url: v.imageUrl!,
    });
  }

  // ── categories ────────────────────────────────────────────────────────────
  const categories = await prisma.category.findMany({
    where: { imageUrl: { contains: OLD_ACCOUNT } },
  });
  for (const c of categories) {
    if (!containsOldAccount(c.imageUrl)) continue;
    rows.push({
      table: "categories",
      id: c.id,
      label: `${c.name} (slug: ${c.slug})`,
      field: "imageUrl",
      url: c.imageUrl!,
    });
  }

  // ── banners ───────────────────────────────────────────────────────────────
  const banners = await prisma.banner.findMany({
    where: { imageUrl: { contains: OLD_ACCOUNT } },
  });
  for (const b of banners) {
    rows.push({
      table: "banners",
      id: b.id,
      label: `"${b.title}" (sortOrder: ${b.sortOrder})`,
      field: "imageUrl",
      url: b.imageUrl,
    });
  }

  // ── order_items (snapshot) ────────────────────────────────────────────────
  const orderItems = await prisma.orderItem.findMany({
    where: { imageUrl: { contains: OLD_ACCOUNT } },
    include: { order: { select: { orderNumber: true } } },
  });
  for (const oi of orderItems) {
    if (!containsOldAccount(oi.imageUrl)) continue;
    rows.push({
      table: "order_items",
      id: oi.id,
      label: `Order ${oi.order.orderNumber} — ${oi.productName} / ${oi.variantName}`,
      field: "imageUrl",
      url: oi.imageUrl!,
    });
  }

  // ── users ─────────────────────────────────────────────────────────────────
  const users = await prisma.user.findMany({
    where: { avatarUrl: { contains: OLD_ACCOUNT } },
    select: { id: true, email: true, name: true, avatarUrl: true },
  });
  for (const u of users) {
    if (!containsOldAccount(u.avatarUrl)) continue;
    rows.push({
      table: "users",
      id: u.id,
      label: `${u.name ?? "(no name)"} <${u.email}>`,
      field: "avatarUrl",
      url: u.avatarUrl!,
    });
  }

  // ── Output ────────────────────────────────────────────────────────────────

  if (JSON_MODE) {
    console.log(JSON.stringify(rows, null, 2));
    return;
  }

  if (rows.length === 0) {
    console.log(`\n✓ Aucune URL contenant "${OLD_ACCOUNT}" trouvée en base.\n`);
    return;
  }

  // Group by table
  const byTable = new Map<string, Row[]>();
  for (const row of rows) {
    const list = byTable.get(row.table) ?? [];
    list.push(row);
    byTable.set(row.table, list);
  }

  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(` Audit Cloudinary — URLs pointant vers l'ancien compte: ${OLD_ACCOUNT}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

  for (const [table, tableRows] of byTable) {
    console.log(`  TABLE: ${table}  (${tableRows.length} enregistrement${tableRows.length > 1 ? "s" : ""})`);
    console.log(`  ${"─".repeat(60)}`);
    for (const r of tableRows) {
      console.log(`  id    : ${r.id}`);
      console.log(`  label : ${r.label}`);
      console.log(`  champ : ${r.field}`);
      console.log(`  url   : ${r.url}`);
      console.log();
    }
  }

  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(` Total : ${rows.length} URL${rows.length > 1 ? "s" : ""} à migrer`);
  const noteOrderItems = byTable.get("order_items");
  if (noteOrderItems) {
    console.log(
      ` Note  : ${noteOrderItems.length} URL${noteOrderItems.length > 1 ? "s" : ""} dans order_items sont des snapshots de commandes passées.`
    );
    console.log(`         Ces lignes peuvent rester telles quelles si les images`);
    console.log(`         sont ré-uploadées sur le nouveau compte sous le même chemin.`);
  }
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
}

main()
  .catch((err) => {
    console.error("Erreur:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
