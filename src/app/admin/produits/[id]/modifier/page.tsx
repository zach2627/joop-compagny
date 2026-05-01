import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { ProductEditForm } from "@/components/admin/ProductEditForm";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";
import { getServerSession } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    select: { name: true },
  });

  return { title: product ? `Modifier - ${product.name}` : "Produit introuvable" };
}

export default async function ModifierProduitPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) redirect("/auth/login");

  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      variants: { orderBy: [{ isDefault: "desc" }, { createdAt: "asc" }] },
      images: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!product) notFound();

  const productData = {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description ?? "",
    shortDescription: product.shortDescription ?? "",
    basePrice: String(product.basePrice),
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      name: variant.name,
      storage: variant.storage,
      color: variant.color,
      colorHex: variant.colorHex,
      price: Number(variant.price),
      compareAt: variant.compareAt ? Number(variant.compareAt) : null,
      stock: variant.stock,
      isDefault: variant.isDefault,
    })),
  };

  const variantColors = [
    ...new Set(
      product.variants
        .map((variant) => variant.color)
        .filter((color): color is string => Boolean(color))
    ),
  ];

  return (
    <div className="max-w-5xl p-8">
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-apple-gray-400">
          Admin - Produits
        </p>
        <h1 className="truncate text-2xl font-bold text-apple-gray-900">{product.name}</h1>
        <p className="mt-0.5 font-mono text-sm text-apple-gray-400">{product.slug}</p>
      </div>

      <ProductEditForm product={productData} />

      <div className="mt-8 space-y-4 rounded-apple-lg border border-apple-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-apple-gray-900">
          Images{" "}
          <span className="text-sm font-normal text-apple-gray-400">
            ({product.images.length})
          </span>
        </h2>
        <ProductImagesManager
          productId={product.id}
          productSlug={product.slug}
          images={product.images}
          variantColors={variantColors}
        />
      </div>
    </div>
  );
}
