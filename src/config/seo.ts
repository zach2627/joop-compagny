import { siteConfig } from "./site";

export const seoConfig = {
  siteName: siteConfig.name,
  siteUrl: siteConfig.url,
  defaultLocale: "fr",
  locales: ["fr", "en"],
  defaultTitle: "JOOP COMPANY - Bijoux, parfums et encens a Dakar",
  defaultDescription:
    "Decouvrez une selection luxe et coloree de bijoux, parfums et encens au Senegal. Paiement Wave et Orange Money, livraison a Dakar et partout au Senegal.",
  defaultTitleEn: "JOOP COMPANY - Jewelry, perfumes and incense in Dakar",
  defaultDescriptionEn:
    "Discover a bold luxury selection of jewelry, perfumes and incense in Senegal. Wave and Orange Money payments with delivery in Dakar and nationwide.",
  twitterHandle: "@JOOPCompany",
  themeColor: "#0A0A08",
};

export const categoryMeta: Record<
  string,
  { title: string; description: string; titleEn: string; descriptionEn: string }
> = {
  bijoux: {
    title: "Bijoux a Dakar - Colliers, bracelets et pieces signatures | JOOP COMPANY",
    description:
      "Explorez des bijoux elegants et colores a Dakar: colliers, bracelets et parures avec finition premium et emballage cadeau.",
    titleEn: "Jewelry in Dakar - Necklaces, bracelets and signature pieces | JOOP COMPANY",
    descriptionEn:
      "Explore elegant colorful jewelry in Dakar: necklaces, bracelets and curated sets with premium finishing and gift-ready packaging.",
  },
  montres: {
    title: "Montres femme a Dakar - Montres dorees et elegantes | JOOP COMPANY",
    description:
      "Decouvrez notre selection de montres dorees et bijoux-montres pour femme, pensees pour sublimer le poignet et completer un look signature.",
    titleEn: "Women's watches in Dakar - Gold watches and elegant timepieces | JOOP COMPANY",
    descriptionEn:
      "Discover our selection of gold-tone and elegant watches for women, designed to elevate the wrist and complete a signature look.",
  },
  parfums: {
    title: "Parfums a Dakar - Eaux de parfum et huiles precieuses | JOOP COMPANY",
    description:
      "Retrouvez des parfums intenses et des huiles parfumees aux accords floraux, ambres et epices, penses pour un sillage memorable.",
    titleEn: "Perfumes in Dakar - Eau de parfum and precious oils | JOOP COMPANY",
    descriptionEn:
      "Discover intense perfumes and perfumed oils with floral, amber and spicy accords designed for a memorable trail.",
  },
  encens: {
    title: "Encens a Dakar - Batons, cones et rituels parfumes | JOOP COMPANY",
    description:
      "Installez une ambiance raffinee avec nos encens aux notes boisees, epicees et florales, parfaits pour la maison ou le rituel personnel.",
    titleEn: "Incense in Dakar - Sticks, cones and scented rituals | JOOP COMPANY",
    descriptionEn:
      "Set a refined atmosphere with incense blends featuring woody, spicy and floral notes for home rituals and gifting.",
  },
  coffrets: {
    title: "Coffrets cadeaux a Dakar | JOOP COMPANY",
    description:
      "Offrez une composition complete JOOP COMPANY avec nos coffrets cadeaux bijoux, parfums et encens prets a offrir.",
    titleEn: "Gift sets in Dakar | JOOP COMPANY",
    descriptionEn:
      "Offer a complete JOOP COMPANY composition with curated gift sets combining jewelry, perfume and incense.",
  },
};
