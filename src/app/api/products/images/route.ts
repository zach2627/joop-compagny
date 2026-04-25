// src/app/api/products/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** Extract Cloudinary public_id from a secure_url.
 *  e.g. https://res.cloudinary.com/cloud/image/upload/v123/products/abc/img.jpg
 *  → products/abc/img
 */
function publicIdFromUrl(url: string): string {
  return url
    .replace(/^.*\/upload\/(?:v\d+\/)?/, "")
    .replace(/\.[^.]+$/, "");
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { productId, url, alt, color } = await req.json();
  if (!productId || !url) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const existingCount = await prisma.productImage.count({ where: { productId } });

  const image = await prisma.productImage.create({
    data: {
      productId,
      url,
      alt: alt ?? null,
      color: color ?? null,
      isPrimary: existingCount === 0,
      sortOrder: existingCount,
    },
  });

  return NextResponse.json({ success: true, image });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { imageId } = await req.json();
  if (!imageId) {
    return NextResponse.json({ error: "imageId manquant" }, { status: 400 });
  }

  const image = await prisma.productImage.findUnique({ where: { id: imageId } });
  if (!image) {
    return NextResponse.json({ error: "Image introuvable" }, { status: 404 });
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  // Si cette image était principale, promouvoir la suivante
  if (image.isPrimary) {
    const next = await prisma.productImage.findFirst({
      where: { productId: image.productId },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    if (next) {
      await prisma.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  }

  // Suppression asynchrone sur Cloudinary (non bloquante)
  try {
    await cloudinary.uploader.destroy(publicIdFromUrl(image.url));
  } catch {
    // Ne pas bloquer la réponse si Cloudinary échoue
  }

  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { imageId, productId, color } = await req.json();
  if (!imageId || !productId) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  // Si `color` est fourni, mise à jour de la couleur uniquement (pas de changement de principale)
  if (color !== undefined) {
    await prisma.productImage.update({
      where: { id: imageId },
      data: { color: color ?? null },
    });
    return NextResponse.json({ success: true });
  }

  // Sinon : changer l'image principale (transaction atomique)
  await prisma.$transaction([
    prisma.productImage.updateMany({ where: { productId }, data: { isPrimary: false } }),
    prisma.productImage.update({ where: { id: imageId }, data: { isPrimary: true } }),
  ]);

  return NextResponse.json({ success: true });
}
