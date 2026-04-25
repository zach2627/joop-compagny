// src/components/seo/ProductStructuredData.tsx
import { siteConfig } from "@/config/site";
import { seoConfig } from "@/config/seo";
import { localizedPath, type Locale } from "@/lib/i18n/config";

interface ProductStructuredDataProps {
  name: string;
  description: string;
  image: string;
  price: number;
  currency?: string;
  slug: string;
  locale?: Locale;
  inStock: boolean;
  brand?: string;
  sku?: string;
  rating?: number;
  reviewCount?: number;
}

export function ProductStructuredData({
  name,
  description,
  image,
  price,
  currency = "XOF",
  slug,
  locale = "fr",
  inStock,
  brand = siteConfig.name,
  sku,
  rating,
  reviewCount,
}: ProductStructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    image: image.startsWith("http") ? image : `${seoConfig.siteUrl}${image}`,
    brand: {
      "@type": "Brand",
      name: brand,
    },
    ...(sku && { sku }),
    offers: {
      "@type": "Offer",
      url: `${seoConfig.siteUrl}${localizedPath(`/store/products/${slug}`, locale)}`,
      priceCurrency: currency,
      price: price.toString(),
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: seoConfig.siteName,
      },
      priceValidUntil: new Date(
        new Date().setFullYear(new Date().getFullYear() + 1)
      )
        .toISOString()
        .split("T")[0],
    },
    ...(rating &&
      reviewCount && {
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: rating.toString(),
          reviewCount: reviewCount.toString(),
          bestRating: "5",
          worstRating: "1",
        },
      }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
