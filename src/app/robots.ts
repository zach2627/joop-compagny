// src/app/robots.ts
import { MetadataRoute } from "next";
import { seoConfig } from "@/config/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/auth", "/store/checkout", "/store/account"],
      },
    ],
    sitemap: `${seoConfig.siteUrl}/sitemap.xml`,
  };
}
