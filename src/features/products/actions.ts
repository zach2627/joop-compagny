"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/lib/db/prisma";
import { getServerSession } from "@/lib/auth/jwt";
import type { ActionResult } from "@/features/auth/actions";

const variantRowSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(2).max(50),
  name: z.string().min(2).max(200),
  storage: z.string().optional(),
  color: z.string().optional(),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal("")),
  price: z.coerce.number().positive(),
  compareAt: z.coerce.number().positive().optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0),
  isDefault: z.boolean().default(false),
});

const updateProductSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z
    .string()
    .min(2)
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Slug invalide (minuscules, chiffres et tirets)"),
  description: z.string().optional(),
  shortDescription: z.string().max(300).optional(),
  basePrice: z.coerce.number().positive(),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
});

const createVariantRowSchema = z.object({
  name: z.string().min(2).max(200),
  storage: z.string().optional(),
  color: z.string().optional(),
  colorHex: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional().or(z.literal("")),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
});

const createImageRowSchema = z.object({
  url: z.string().url(),
  alt: z.string().max(200).optional(),
  color: z.string().max(120).optional(),
  isPrimary: z.boolean().default(false),
});

const createProductSchema = updateProductSchema.extend({
  categoryId: z.string().cuid("Categorie invalide"),
});

function getStockStatus(stock: number) {
  if (stock <= 0) return "OUT_OF_STOCK" as const;
  if (stock <= 5) return "LOW_STOCK" as const;
  return "IN_STOCK" as const;
}

function skuPart(value: string, fallback: string) {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return (normalized || fallback).slice(0, 18);
}

function generateVariantSku(productSlug: string, variantName: string, index: number) {
  const random = crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
  const base = skuPart(productSlug, "PROD");
  const variant = skuPart(variantName, `VAR${index + 1}`);

  return `JCP-${base}-${variant}-${random}`.slice(0, 50);
}

export async function createProductAction(
  formData: FormData
): Promise<ActionResult<{ productId: string }>> {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return { success: false, error: "Non autorise" };
  }

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? undefined,
    shortDescription: formData.get("shortDescription") ?? undefined,
    basePrice: formData.get("basePrice"),
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive") === "true",
    isFeatured: false,
  };

  const parsedProduct = createProductSchema.safeParse(raw);
  if (!parsedProduct.success) {
    const msg = parsedProduct.error.issues.map((issue) => issue.message).join(" · ");
    return { success: false, error: msg };
  }

  let variantsRaw: unknown[];
  try {
    variantsRaw = JSON.parse(formData.get("variants") as string);
  } catch {
    return { success: false, error: "Donnees de variantes invalides" };
  }

  let imagesRaw: unknown[] = [];
  try {
    const imagesValue = formData.get("images");
    if (typeof imagesValue === "string" && imagesValue.trim()) {
      imagesRaw = JSON.parse(imagesValue);
    }
  } catch {
    return { success: false, error: "Donnees d'images invalides" };
  }

  const variantsParsed = z.array(createVariantRowSchema).min(1).safeParse(variantsRaw);
  if (!variantsParsed.success) {
    const msg = variantsParsed.error.issues.map((issue) => issue.message).join(" · ");
    return { success: false, error: `Variantes: ${msg}` };
  }

  const imagesParsed = z.array(createImageRowSchema).safeParse(imagesRaw);
  if (!imagesParsed.success) {
    const msg = imagesParsed.error.issues.map((issue) => issue.message).join(" · ");
    return { success: false, error: `Images: ${msg}` };
  }

  const slugConflict = await prisma.product.findUnique({
    where: { slug: parsedProduct.data.slug },
    select: { id: true },
  });
  if (slugConflict) {
    return { success: false, error: "Ce slug est deja utilise par un autre produit." };
  }

  const category = await prisma.category.findUnique({
    where: { id: parsedProduct.data.categoryId },
    select: { id: true },
  });
  if (!category) {
    return { success: false, error: "Categorie introuvable." };
  }

  try {
    const uploadedImages = imagesParsed.data;
    const hasPrimaryImage = uploadedImages.some((image) => image.isPrimary);

    const product = await prisma.product.create({
      data: {
        name: parsedProduct.data.name,
        slug: parsedProduct.data.slug,
        description: parsedProduct.data.description ?? null,
        shortDescription: parsedProduct.data.shortDescription ?? null,
        categoryId: parsedProduct.data.categoryId,
        basePrice: parsedProduct.data.basePrice,
        isActive: parsedProduct.data.isActive,
        isFeatured: false,
        tags: [],
        variants: {
          create: variantsParsed.data.map((variant, index) => ({
            sku: generateVariantSku(parsedProduct.data.slug, variant.name, index),
            name: variant.name,
            storage: variant.storage || null,
            color: variant.color || null,
            colorHex: variant.colorHex || null,
            price: variant.price,
            stock: variant.stock,
            stockStatus: getStockStatus(variant.stock),
            isDefault: index === 0,
          })),
        },
        images:
          uploadedImages.length > 0
            ? {
                create: uploadedImages.map((image, index) => ({
                  url: image.url,
                  alt: image.alt?.trim() || parsedProduct.data.name,
                  color: image.color?.trim() || null,
                  isPrimary: image.isPrimary || (!hasPrimaryImage && index === 0),
                  sortOrder: index,
                })),
              }
            : undefined,
      },
      select: { id: true, slug: true },
    });

    revalidatePath("/admin/produits");
    revalidatePath("/admin/products");
    revalidatePath("/store/products");
    revalidatePath(`/store/products/${product.slug}`);

    return { success: true, data: { productId: product.id } };
  } catch (error) {
    console.error("createProductAction:", error);
    return { success: false, error: "Erreur serveur lors de la creation." };
  }
}

export async function updateProductAction(
  productId: string,
  formData: FormData
): Promise<ActionResult<{ productId: string }>> {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return { success: false, error: "Non autorise" };
  }

  const raw = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description") ?? undefined,
    shortDescription: formData.get("shortDescription") ?? undefined,
    basePrice: formData.get("basePrice"),
    isActive: formData.get("isActive") === "true",
    isFeatured: formData.get("isFeatured") === "true",
  };

  const parsedProduct = updateProductSchema.safeParse(raw);
  if (!parsedProduct.success) {
    const msg = parsedProduct.error.issues.map((issue) => issue.message).join(" · ");
    return { success: false, error: msg };
  }

  let variantsRaw: unknown[];
  let deletedIds: string[];
  try {
    variantsRaw = JSON.parse(formData.get("variants") as string);
    deletedIds = JSON.parse(formData.get("deletedVariantIds") as string);
  } catch {
    return { success: false, error: "Donnees de variantes invalides" };
  }

  const variantsParsed = z.array(variantRowSchema).safeParse(variantsRaw);
  if (!variantsParsed.success) {
    const msg = variantsParsed.error.issues.map((issue) => issue.message).join(" · ");
    return { success: false, error: `Variantes: ${msg}` };
  }
  const variants = variantsParsed.data;

  const slugConflict = await prisma.product.findFirst({
    where: { slug: parsedProduct.data.slug, NOT: { id: productId } },
  });
  if (slugConflict) {
    return { success: false, error: "Ce slug est deja utilise par un autre produit." };
  }

  const hasDefault = variants.some((variant) => variant.isDefault);
  if (variants.length > 0 && !hasDefault) {
    variants[0].isDefault = true;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id: productId },
        data: {
          name: parsedProduct.data.name,
          slug: parsedProduct.data.slug,
          description: parsedProduct.data.description ?? null,
          shortDescription: parsedProduct.data.shortDescription ?? null,
          basePrice: parsedProduct.data.basePrice,
          isActive: parsedProduct.data.isActive,
          isFeatured: parsedProduct.data.isFeatured,
        },
      });

      if (deletedIds.length > 0) {
        await tx.productVariant.deleteMany({
          where: { id: { in: deletedIds }, productId },
        });
      }

      for (const variant of variants) {
        const data = {
          sku: variant.sku,
          name: variant.name,
          storage: variant.storage || null,
          color: variant.color || null,
          colorHex: variant.colorHex || null,
          price: variant.price,
          compareAt: variant.compareAt ? Number(variant.compareAt) : null,
          stock: variant.stock,
          isDefault: variant.isDefault,
          stockStatus: getStockStatus(variant.stock),
        };

        if (variant.id) {
          await tx.productVariant.update({ where: { id: variant.id }, data });
        } else {
          await tx.productVariant.create({ data: { ...data, productId } });
        }
      }
    });

    revalidatePath("/admin/produits");
    revalidatePath("/admin/products");
    revalidatePath(`/store/products/${parsedProduct.data.slug}`);
    return { success: true, data: { productId } };
  } catch (error) {
    console.error("updateProductAction:", error);
    return { success: false, error: "Erreur serveur lors de la sauvegarde." };
  }
}
