// src/features/products/service.ts
import prisma from "@/lib/db/prisma";
import type { ProductFilter } from "@/lib/validation/schemas";
import { unstable_cache } from "next/cache";

// ─── Queries ──────────────────────────────────────────────────────────────────

export const getProducts = (filters: ProductFilter) =>
  unstable_cache(
    async () => {
      const {
        category,
        minPrice,
        maxPrice,
        color,
        storage,
        inStock,
        sort,
        page,
        limit,
        q,
      } = filters;

      const skip = (page - 1) * limit;

      const where = {
        isActive: true,
        ...(q && {
          OR: [
            { name: { contains: q, mode: "insensitive" as const } },
            { description: { contains: q, mode: "insensitive" as const } },
            { tags: { hasSome: [q.toLowerCase()] } },
          ],
        }),
        ...(category && {
          category: { slug: category },
        }),
        variants: {
          some: {
            ...(minPrice && { price: { gte: minPrice } }),
            ...(maxPrice && { price: { lte: maxPrice } }),
            ...(color && { color: { contains: color, mode: "insensitive" as const } }),
            ...(storage && { storage }),
            ...(inStock && { stockStatus: { in: ["IN_STOCK", "LOW_STOCK"] as ("IN_STOCK" | "LOW_STOCK")[] } }),
          },
        },
      };

      const orderBy = {
        newest: { createdAt: "desc" as const },
        price_asc: { basePrice: "asc" as const },
        price_desc: { basePrice: "desc" as const },
        popular: { createdAt: "desc" as const },
        featured: { isFeatured: "desc" as const },
      }[sort];

      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy,
          skip,
          take: limit,
          include: {
            category: { select: { name: true, slug: true } },
            images: { where: { isPrimary: true }, take: 1 },
            variants: {
              orderBy: [{ isDefault: "desc" }, { price: "asc" }],
              take: 10,
            },
            _count: { select: { reviews: true } },
          },
        }),
        prisma.product.count({ where }),
      ]);

      return {
        products,
        total,
        pages: Math.ceil(total / limit),
        page,
      };
    },
    ["products-list", JSON.stringify(filters)],
    { revalidate: 300, tags: ["products"] }
  )();

export const getProductBySlug = unstable_cache(
  async (slug: string) => {
    return prisma.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: [{ isDefault: "desc" }, { price: "asc" }] },
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { name: true, avatarUrl: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: { select: { reviews: true } },
      },
    });
  },
  ["product-detail"],
  { revalidate: 300, tags: ["products"] }
);

export const getFeaturedProducts = unstable_cache(
  async () => {
    return prisma.product.findMany({
      where: { isFeatured: true, isActive: true },
      include: {
        images: { where: { isPrimary: true }, take: 1 },
        variants: {
          where: { isDefault: true },
          take: 1,
        },
        category: { select: { name: true, slug: true } },
      },
      take: 8,
      orderBy: { updatedAt: "desc" },
    });
  },
  ["featured-products"],
  { revalidate: 600, tags: ["products"] }
);

export const getCategories = unstable_cache(
  async () => {
    return prisma.category.findMany({
      where: { isActive: true, parentId: null },
      include: {
        _count: { select: { products: true } },
        children: {
          where: { isActive: true },
          include: { _count: { select: { products: true } } },
        },
      },
      orderBy: { sortOrder: "asc" },
    });
  },
  ["categories"],
  { revalidate: 3600, tags: ["categories"] }
);

// ─── Admin product mutations ──────────────────────────────────────────────────

export async function updateProductStock(
  variantId: string,
  stock: number
): Promise<void> {
  const stockStatus =
    stock === 0 ? "OUT_OF_STOCK" : stock <= 5 ? "LOW_STOCK" : "IN_STOCK";

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock, stockStatus },
  });
}

export async function deductStock(
  variantId: string,
  qty: number
): Promise<boolean> {
  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    select: { stock: true },
  });

  if (!variant || variant.stock < qty) return false;

  const newStock = variant.stock - qty;
  const stockStatus =
    newStock === 0 ? "OUT_OF_STOCK" : newStock <= 5 ? "LOW_STOCK" : "IN_STOCK";

  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: newStock, stockStatus },
  });

  return true;
}
