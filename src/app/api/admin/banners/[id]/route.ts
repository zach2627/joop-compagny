// src/app/api/admin/banners/[id]/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";
import { normalizeBannerCtaHref } from "@/features/banners/utils";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const imageUrl = typeof body.imageUrl === "string" ? body.imageUrl.trim() : "";
  const sortOrder = Number.parseInt(String(body.sortOrder ?? 0), 10);

  if (!title || !imageUrl) {
    return NextResponse.json(
      { error: "Image et titre requis." },
      { status: 400 }
    );
  }

  try {
    const banner = await prisma.banner.update({
      where: { id: params.id },
      data: {
        imageUrl,
        eyebrow: typeof body.eyebrow === "string" ? body.eyebrow.trim() : "",
        showEyebrow: typeof body.showEyebrow === "boolean" ? body.showEyebrow : true,
        title,
        subtitle: typeof body.subtitle === "string" ? body.subtitle.trim() : "",
        ctaLabel:
          typeof body.ctaLabel === "string" && body.ctaLabel.trim()
            ? body.ctaLabel.trim()
            : "Découvrir",
        ctaHref: normalizeBannerCtaHref(body.ctaHref),
        sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
        isActive: typeof body.isActive === "boolean" ? body.isActive : true,
      },
    });

    return NextResponse.json({
      ...banner,
      ctaHref: normalizeBannerCtaHref(banner.ctaHref),
    });
  } catch {
    return NextResponse.json(
      { error: "Bannière introuvable" },
      { status: 404 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await prisma.banner.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
