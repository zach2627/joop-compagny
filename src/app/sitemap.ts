// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { seoConfig } from "@/config/seo";
import prisma from "@/lib/db/prisma";
import { localizedPath, type Locale } from "@/lib/i18n/config";

const SITEMAP_LOCALES: Locale[] = ["fr", "en"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = seoConfig.siteUrl;
  const absoluteUrl = (path: string, locale: Locale) => {
    const localized = localizedPath(path, locale);
    return localized === "/" ? baseUrl : `${baseUrl}${localized}`;
  };

  const staticPages: MetadataRoute.Sitemap = SITEMAP_LOCALES.flatMap((locale) => [
    {
      url: absoluteUrl("/", locale),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: locale === "fr" ? 1 : 0.9,
    },
    {
      url: absoluteUrl("/store/products", locale),
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: locale === "fr" ? 0.9 : 0.8,
    },
  ]);

  let productPages: MetadataRoute.Sitemap = [];
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });
    productPages = products.flatMap((product) => SITEMAP_LOCALES.map((locale) => ({
      url: absoluteUrl(`/store/products/${product.slug}`, locale),
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: locale === "fr" ? 0.7 : 0.6,
    })));
  } catch {
    // Static pages stay available even if the database is unreachable.
  }

  return [...staticPages, ...productPages];
}
