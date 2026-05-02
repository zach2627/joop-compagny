// src/config/site.ts

export const siteConfig = {
  name: "JOOP COMPAGNY",
  shortName: "JOOP",
  description:
    "Maison senegalaise de bijoux, parfums et encens avec une direction artistique luxe et coloree.",
  tagline: "Bijoux, parfums et encens au coeur de Dakar",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://joop-compagny.com",
  email: "contact@joop-compagny.com",
  phone: "+221 77 000 00 00",
  address: "Dakar, Senegal",
  currency: "XOF",
  navCategories: ["bijoux", "montres", "parfums", "encens", "coffrets"] as const,
};
