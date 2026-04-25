import { siteConfig } from "./site";

export const seoConfig = {
  siteName: siteConfig.name,
  siteUrl: siteConfig.url,
  defaultLocale: "fr",
  locales: ["fr", "en"],
  defaultTitle: "JOOP COMPAGNY - Bijoux, parfums et encens a Dakar",
  defaultDescription:
    "Decouvrez une selection luxe et coloree de bijoux, parfums et encens au Senegal. Paiement Wave et Orange Money, livraison a Dakar et partout au Senegal.",
  defaultTitleEn: "JOOP COMPAGNY - Jewelry, perfumes and incense in Dakar",
  defaultDescriptionEn:
    "Discover a bold luxury selection of jewelry, perfumes and incense in Senegal. Wave and Orange Money payments with delivery in Dakar and nationwide.",
  twitterHandle: "@JOOPCompagny",
  themeColor: "#130b19",
};

export const categoryMeta: Record<
  string,
  { title: string; description: string; titleEn: string; descriptionEn: string }
> = {
  bijoux: {
    title: "Bijoux a Dakar - Colliers, bracelets et pieces signatures | JOOP COMPAGNY",
    description:
      "Explorez des bijoux elegants et colores a Dakar: colliers, bracelets et parures avec finition premium et emballage cadeau.",
    titleEn: "Jewelry in Dakar - Necklaces, bracelets and signature pieces | JOOP COMPAGNY",
    descriptionEn:
      "Explore elegant colorful jewelry in Dakar: necklaces, bracelets and curated sets with premium finishing and gift-ready packaging.",
  },
  parfums: {
    title: "Parfums a Dakar - Eaux de parfum et huiles precieuses | JOOP COMPAGNY",
    description:
      "Retrouvez des parfums intenses et des huiles parfumees aux accords floraux, ambres et epices, penses pour un sillage memorable.",
    titleEn: "Perfumes in Dakar - Eau de parfum and precious oils | JOOP COMPAGNY",
    descriptionEn:
      "Discover intense perfumes and perfumed oils with floral, amber and spicy accords designed for a memorable trail.",
  },
  encens: {
    title: "Encens a Dakar - Batons, cones et rituels parfumes | JOOP COMPAGNY",
    description:
      "Installez une ambiance raffinee avec nos encens aux notes boisees, epicees et florales, parfaits pour la maison ou le rituel personnel.",
    titleEn: "Incense in Dakar - Sticks, cones and scented rituals | JOOP COMPAGNY",
    descriptionEn:
      "Set a refined atmosphere with incense blends featuring woody, spicy and floral notes for home rituals and gifting.",
  },
  coffrets: {
    title: "Coffrets cadeaux a Dakar | JOOP COMPAGNY",
    description:
      "Offrez une composition complete JOOP COMPAGNY avec nos coffrets cadeaux bijoux, parfums et encens prets a offrir.",
    titleEn: "Gift sets in Dakar | JOOP COMPAGNY",
    descriptionEn:
      "Offer a complete JOOP COMPAGNY composition with curated gift sets combining jewelry, perfume and incense.",
  },
};
