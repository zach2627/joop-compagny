// src/app/api/admin/banners/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";
import { normalizeBannerCtaHref } from "@/features/banners/utils";

export async function GET() {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const banners = await prisma.banner.findMany({
    orderBy: { sortOrder: "asc" },
  });
  return NextResponse.json(
    banners.map((banner) => ({
      ...banner,
      ctaHref: normalizeBannerCtaHref(banner.ctaHref),
    }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const body = await req.json();
  const banner = await prisma.banner.create({
    data: {
      imageUrl: body.imageUrl,
      eyebrow: typeof body.eyebrow === "string" ? body.eyebrow.trim() : "",
      showEyebrow: typeof body.showEyebrow === "boolean" ? body.showEyebrow : true,
      title: body.title,
      subtitle: body.subtitle ?? "",
      ctaLabel: body.ctaLabel ?? "Decouvrir",
      ctaHref: normalizeBannerCtaHref(body.ctaHref),
      sortOrder: body.sortOrder ?? 0,
    },
  });

  return NextResponse.json(banner);
}
