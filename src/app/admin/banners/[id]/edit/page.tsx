import type { Metadata } from "next";
import { ImageIcon } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";
import {
  BannerEditForm,
  type BannerEditData,
} from "@/components/admin/BannerEditForm";
import { normalizeBannerCtaHref } from "@/features/banners/utils";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const banner = await prisma.banner.findUnique({
    where: { id: params.id },
    select: { title: true },
  });

  return {
    title: banner ? `Modifier — ${banner.title}` : "Bannière introuvable",
  };
}

export default async function EditBannerPage({ params }: PageProps) {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) redirect("/auth/login");

  const banner = await prisma.banner.findUnique({
    where: { id: params.id },
  });

  if (!banner) notFound();

  const bannerData: BannerEditData = {
    id: banner.id,
    imageUrl: banner.imageUrl,
    eyebrow: banner.eyebrow,
    showEyebrow: banner.showEyebrow,
    title: banner.title,
    subtitle: banner.subtitle,
    ctaLabel: banner.ctaLabel,
    ctaHref: normalizeBannerCtaHref(banner.ctaHref),
    sortOrder: banner.sortOrder,
    isActive: banner.isActive,
  };

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-apple-md bg-apple-blue/10 flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-apple-blue" />
        </div>
        <div>
          <p className="text-xs font-semibold text-apple-gray-400 uppercase tracking-widest mb-1">
            Admin · Bannières
          </p>
          <h1 className="text-2xl font-bold text-apple-gray-900">
            Modifier la bannière
          </h1>
          <p className="text-sm text-apple-gray-500">
            Ajustez l&apos;image, le texte et le lien affichés sur la page d&apos;accueil.
          </p>
        </div>
      </div>

      <BannerEditForm banner={bannerData} />
    </div>
  );
}
