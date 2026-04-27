import { buildCloudinaryUploadUrl } from "@/lib/images/cloudinary";

export type ProductGalleryImage = {
  id: string;
  url: string;
  alt: string | null;
  color: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

type SourceProductImage = {
  id?: string;
  url: string;
  alt?: string | null;
  color?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
};

type GallerySeedImage = {
  url: string;
  alt: string;
  color?: string | null;
};

const JOOP_CLOUDINARY_IMAGES = {
  img8500: buildCloudinaryUploadUrl("v1777245304/IMG_8500_zik0hd.jpg"),
  img8501: buildCloudinaryUploadUrl("v1777245304/IMG_8501_ughssj.jpg"),
  img8502: buildCloudinaryUploadUrl("v1777245304/IMG_8502_jmk74x.jpg"),
  img8503: buildCloudinaryUploadUrl("v1777245304/IMG_8503_g6z7or.jpg"),
  img8504: buildCloudinaryUploadUrl("v1777245305/IMG_8504_yfdqba.jpg"),
  img8505: buildCloudinaryUploadUrl("v1777245305/IMG_8505_md1ixp.jpg"),
  img8507: buildCloudinaryUploadUrl("v1777245306/IMG_8507_iy1bia.jpg"),
  img8508: buildCloudinaryUploadUrl("v1777245306/IMG_8508_aczzzu.jpg"),
  img8509: buildCloudinaryUploadUrl("v1777245307/IMG_8509_crughg.jpg"),
  img8510: buildCloudinaryUploadUrl("v1777245307/IMG_8510_jlgljs.jpg"),
  img8511: buildCloudinaryUploadUrl("v1777245308/IMG_8511_c8vowo.jpg"),
  img8512: buildCloudinaryUploadUrl("v1777245309/IMG_8512_qkstcw.png"),
  img8513: buildCloudinaryUploadUrl("v1777245309/IMG_8513_rvsqdr.jpg"),
} as const;

const PRODUCT_GALLERIES: Record<string, GallerySeedImage[]> = {
  "collier-naya-aura": [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8507,
      alt: "Collier Naya Aura - Or soleil",
      color: "Or soleil",
    },
    {
      url: JOOP_CLOUDINARY_IMAGES.img8505,
      alt: "Collier Naya Aura - Rose cuivre",
      color: "Rose cuivre",
    },
  ],
  "bracelet-sira-glow": [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8507,
      alt: "Bracelet Sira Glow - Or sable",
      color: "Or sable",
    },
    {
      url: JOOP_CLOUDINARY_IMAGES.img8502,
      alt: "Bracelet Sira Glow - Onyx minuit",
      color: "Onyx minuit",
    },
  ],
  "eau-de-parfum-noor": [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8500,
      alt: "Eau de parfum Noor",
      color: "Ambre rubis",
    },
    {
      url: JOOP_CLOUDINARY_IMAGES.img8501,
      alt: "Eau de parfum Noor - visuel editorial",
      color: "Ambre rubis",
    },
  ],
  "huile-parfum-kora": [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8505,
      alt: "Huile de parfum Kora",
      color: "Sable dore",
    },
    {
      url: JOOP_CLOUDINARY_IMAGES.img8503,
      alt: "Huile de parfum Kora - visuel editorial",
      color: "Sable dore",
    },
  ],
  "encens-terre-rouge": [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8500,
      alt: "Encens Terre Rouge",
      color: "Terre safran",
    },
    {
      url: JOOP_CLOUDINARY_IMAGES.img8507,
      alt: "Encens Terre Rouge - visuel editorial",
      color: "Terre safran",
    },
  ],
  "encens-nuit-fleurie": [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8501,
      alt: "Encens Nuit Fleurie",
      color: "Violet nuit",
    },
    {
      url: JOOP_CLOUDINARY_IMAGES.img8509,
      alt: "Encens Nuit Fleurie - visuel editorial",
      color: "Violet nuit",
    },
  ],
  "coffret-lumiere-dakar": [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8504,
      alt: "Coffret Lumiere de Dakar",
      color: "Lumiere",
    },
    {
      url: JOOP_CLOUDINARY_IMAGES.img8503,
      alt: "Coffret Lumiere de Dakar - vue atelier",
      color: "Lumiere",
    },
    {
      url: JOOP_CLOUDINARY_IMAGES.img8513,
      alt: "Coffret Lumiere de Dakar - detail",
      color: "Lumiere",
    },
  ],
  "coffret-rituel-precieux": [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8502,
      alt: "Coffret Rituel Precieux",
      color: "Prune royale",
    },
    {
      url: JOOP_CLOUDINARY_IMAGES.img8511,
      alt: "Coffret Rituel Precieux - detail",
      color: "Prune royale",
    },
    {
      url: JOOP_CLOUDINARY_IMAGES.img8510,
      alt: "Coffret Rituel Precieux - vue atelier",
      color: "Prune royale",
    },
  ],
};

const CATEGORY_FALLBACKS: Record<string, GallerySeedImage[]> = {
  bijoux: [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8508,
      alt: "Piece bijoux JOOP COMPAGNY",
      color: null,
    },
    {
      url: JOOP_CLOUDINARY_IMAGES.img8509,
      alt: "Selection bijoux JOOP COMPAGNY",
      color: null,
    },
  ],
  parfums: [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8505,
      alt: "Parfum JOOP COMPAGNY",
      color: null,
    },
  ],
  encens: [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8501,
      alt: "Encens JOOP COMPAGNY",
      color: null,
    },
  ],
  coffrets: [
    {
      url: JOOP_CLOUDINARY_IMAGES.img8504,
      alt: "Coffret JOOP COMPAGNY",
      color: null,
    },
  ],
};

function normalizeValue(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function buildResolvedImages(seedImages: GallerySeedImage[]): ProductGalleryImage[] {
  return seedImages.map((image, index) => ({
    id: `curated-${index}-${image.url}`,
    url: image.url,
    alt: image.alt,
    color: image.color ?? null,
    isPrimary: index === 0,
    sortOrder: index,
  }));
}

function normalizeIncomingImages(images: SourceProductImage[]): ProductGalleryImage[] {
  return images.map((image, index) => ({
    id: image.id ?? `image-${index}-${image.url}`,
    url: image.url,
    alt: image.alt ?? null,
    color: image.color ?? null,
    isPrimary: image.isPrimary ?? index === 0,
    sortOrder: image.sortOrder ?? index,
  }));
}

function isPlaceholderProductImage(url: string | null | undefined) {
  return (url ?? "").startsWith("/images/products/");
}

function shouldUseCuratedGallery(images: SourceProductImage[]) {
  return images.length === 0 || images.every((image) => isPlaceholderProductImage(image.url));
}

export function getCuratedProductImages(
  slug: string,
  categorySlug?: string | null
): ProductGalleryImage[] | null {
  const gallery = PRODUCT_GALLERIES[slug];
  if (gallery) {
    return buildResolvedImages(gallery);
  }

  const categoryGallery = categorySlug ? CATEGORY_FALLBACKS[categorySlug] : null;
  return categoryGallery ? buildResolvedImages(categoryGallery) : null;
}

export function resolveProductImages(
  slug: string,
  images: SourceProductImage[],
  categorySlug?: string | null
): ProductGalleryImage[] {
  if (!shouldUseCuratedGallery(images)) {
    return normalizeIncomingImages(images);
  }

  return getCuratedProductImages(slug, categorySlug) ?? normalizeIncomingImages(images);
}

export function getProductImageUrl(
  slug: string,
  options?: {
    color?: string | null;
    categorySlug?: string | null;
    fallbackUrl?: string | null;
  }
) {
  const fallbackUrl = options?.fallbackUrl ?? null;
  const shouldUseCurated = !fallbackUrl || isPlaceholderProductImage(fallbackUrl);
  const gallery = shouldUseCurated
    ? getCuratedProductImages(slug, options?.categorySlug)
    : null;

  if (!gallery?.length) {
    return fallbackUrl;
  }

  const normalizedColor = normalizeValue(options?.color);
  if (normalizedColor) {
    const match = gallery.find((image) => normalizeValue(image.color) === normalizedColor);
    if (match) {
      return match.url;
    }
  }

  return gallery[0]?.url ?? fallbackUrl;
}
