// src/app/robots.ts
import { MetadataRoute } from "next";
import { seoConfig } from "@/config/seo";
import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n/config";

export default function robots(): MetadataRoute.Robots {
  const protectedPaths = [
    "/admin",
    "/api",
    "/auth",
    "/store/checkout",
    "/store/account",
  ];
  const localizedProtectedPaths = LOCALES.flatMap((locale) =>
    locale === DEFAULT_LOCALE
      ? protectedPaths
      : protectedPaths.map((path) => `/${locale}${path}`)
  );

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: localizedProtectedPaths,
      },
    ],
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
  };
}
