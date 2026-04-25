import type { Locale } from "./config";

type ProductContentSource = {
  slug: string;
  name: string;
  description?: string | null;
  shortDescription?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

type ProductContent = {
  name?: string;
  description?: string;
  shortDescription?: string;
  metaTitle?: string;
  metaDescription?: string;
};

const enProductContent: Record<string, ProductContent> = {
  "collier-naya-aura": {
    name: "Naya Aura Necklace",
    shortDescription: "Signature chain. Warm gold glow. Gift-ready.",
    description:
      "A luminous necklace designed to catch light softly and elevate everyday silhouettes. Finished with a polished chain and a gift-ready presentation.",
  },
  "bracelet-sira-glow": {
    name: "Sira Glow Bracelet",
    shortDescription: "Textured cuff. Bold contrast. Effortless shine.",
    description:
      "A sculptural bracelet made for layering or wearing solo. Its warm metallic finish and darker accent option create a confident, polished look.",
  },
  "eau-de-parfum-noor": {
    name: "Noor Eau de Parfum",
    shortDescription: "Amber rose. Saffron warmth. Long-lasting trail.",
    description:
      "Noor opens with luminous spices before revealing a floral amber heart and a smooth woody base designed to linger elegantly on skin and fabric.",
  },
  "huile-parfum-kora": {
    name: "Kora Perfume Oil",
    shortDescription: "Soft oil perfume. Floral amber. Intimate and rich.",
    description:
      "A concentrated perfume oil with a silky touch, blending floral notes, amber depth and a warm musky finish for close-to-skin luxury.",
  },
  "encens-terre-rouge": {
    name: "Terre Rouge Incense",
    shortDescription: "Woody spice blend. Warm atmosphere. Daily ritual.",
    description:
      "A refined incense blend with warm spice, wood and resin accents that transforms a room into a calm, enveloping space.",
  },
  "encens-nuit-fleurie": {
    name: "Nuit Fleurie Incense",
    shortDescription: "Floral smoke. Velvet mood. Evening ritual.",
    description:
      "Nuit Fleurie wraps floral notes in a smoky veil to create an atmospheric ritual ideal for the end of the day or intimate gatherings.",
  },
  "coffret-lumiere-dakar": {
    name: "Lumiere de Dakar Gift Set",
    shortDescription: "Jewelry, perfume and incense in one vibrant edit.",
    description:
      "A colorful gift set curated to combine shine, scent and mood. Ideal for celebrations, thoughtful gifts and signature moments.",
  },
  "coffret-rituel-precieux": {
    name: "Precious Ritual Gift Set",
    shortDescription: "Layered scent, jewelry detail and gift-ready luxury.",
    description:
      "A premium gift set that gathers JOOP COMPAGNY essentials into a single polished experience for gifting or personal indulgence.",
  },
};

const enVariantNames: Record<string, Record<string, string>> = {
  "collier-naya-aura": {
    "Collier Naya Aura - Or soleil": "Naya Aura Necklace - Sun Gold",
    "Collier Naya Aura - Rose cuivre": "Naya Aura Necklace - Copper Rose",
  },
  "bracelet-sira-glow": {
    "Bracelet Sira Glow - Or sable": "Sira Glow Bracelet - Sand Gold",
    "Bracelet Sira Glow - Onyx minuit": "Sira Glow Bracelet - Midnight Onyx",
  },
};

export function translateProductContent<T extends ProductContentSource>(
  locale: Locale,
  product: T
) {
  if (locale !== "en") {
    return {
      name: product.name,
      description: product.description ?? null,
      shortDescription: product.shortDescription ?? null,
      metaTitle: product.metaTitle ?? null,
      metaDescription: product.metaDescription ?? null,
    };
  }

  const override = enProductContent[product.slug];
  const name = override?.name ?? product.name;
  const shortDescription =
    override?.shortDescription ?? product.shortDescription ?? null;
  const description = override?.description ?? product.description ?? null;

  return {
    name,
    description,
    shortDescription,
    metaTitle: override?.metaTitle ?? product.metaTitle ?? name,
    metaDescription:
      override?.metaDescription ?? product.metaDescription ?? shortDescription,
  };
}

export function translateVariantName(
  locale: Locale,
  productSlug: string,
  variantName: string
) {
  if (locale !== "en") return variantName;
  return enVariantNames[productSlug]?.[variantName] ?? variantName;
}

export function translateProductImageAlt(
  locale: Locale,
  productSlug: string,
  alt: string | null | undefined,
  fallback: string
) {
  const value = alt || fallback;
  if (locale !== "en") return value;

  return value
    .replace("Collier", "Necklace")
    .replace("Bracelet", "Bracelet")
    .replace("Or soleil", "Sun Gold")
    .replace("Rose cuivre", "Copper Rose")
    .replace("Or sable", "Sand Gold")
    .replace("Onyx minuit", "Midnight Onyx")
    .replace("Huile de parfum", "Perfume Oil")
    .replace("Encens", "Incense")
    .replace("Coffret", "Gift Set");
}
