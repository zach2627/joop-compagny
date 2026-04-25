import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { seoConfig } from "@/config/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: seoConfig.siteName,
    short_name: siteConfig.shortName,
    description: seoConfig.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#120816",
    theme_color: "#120816",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-touch-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
