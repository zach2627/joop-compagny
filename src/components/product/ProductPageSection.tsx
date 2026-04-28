// src/components/product/ProductPageSection.tsx
"use client";

import { useState } from "react";
import { ProductVariantSelector, type ProductImage } from "./ProductVariantSelector";
import type { Locale } from "@/lib/i18n/config";
import {
  productDetailImage,
  productThumbnailImage,
} from "@/lib/images/cloudinary";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";

interface Variant {
  id: string;
  name: string;
  storage?: string;
  color?: string;
  colorHex?: string | null;
  price: number;
  compareAt?: number;
  stock: number;
  stockStatus: string;
  isDefault: boolean;
}

interface Props {
  productId: string;
  productName: string;
  primaryImageUrl: string | null;
  primaryImageAlt: string;
  productImages: ProductImage[];
  locale: Locale;
  variants: Variant[];
  storageOptions: string[];
  colorOptions: { color: string; hex: string | null }[];
  variantLabels: {
    storage: string;
    color: string;
    lowStock: string;
    outOfStock: string;
    quantity: string;
    decrease: string;
    increase: string;
    adding: string;
    added: string;
    add: string;
  };
  /** Slot JSX pour le bloc d'info produit (côté droit) */
  infoSlot: React.ReactNode;
}

export function ProductPageSection({
  productId,
  productName,
  primaryImageUrl,
  primaryImageAlt,
  productImages,
  locale,
  variants,
  storageOptions,
  colorOptions,
  variantLabels,
  infoSlot,
}: Props) {
  // URL de l'image actuellement affichée dans la grande vue
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(
    primaryImageUrl
  );

  return (
    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">

      {/* ── Galerie ─────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Image principale */}
        <div
          className="relative aspect-square rounded-apple-xl overflow-hidden"
          style={{
            background: "#1A1A14",
            border: "1px solid rgba(201,168,76,0.15)",
          }}
        >
          <ProductImageFallback
            src={productDetailImage(activeImageUrl)}
            alt={
              productImages.find((i) => i.url === activeImageUrl)?.alt ??
              primaryImageAlt
            }
            label={productName}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
            imageClassName="object-contain p-8 transition-opacity duration-300"
            fallbackClassName="absolute inset-0"
          />
        </div>

        {/* Miniatures — cliquables + indicateur actif */}
        {productImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {productImages.map((img) => {
              const isActive = img.url === activeImageUrl;
              return (
                <button
                  key={img.id}
                  onClick={() => setActiveImageUrl(img.url)}
                  title={img.alt ?? img.color ?? productName}
                  className="relative w-20 h-20 shrink-0 rounded-apple-md overflow-hidden
                             transition-all duration-200 focus-visible:outline-2
                             focus-visible:outline-offset-2 focus-visible:outline-[#C9A84C]"
                  style={{
                    background: "#1A1A14",
                    border: `2px solid ${
                      isActive
                        ? "rgba(201,168,76,0.8)"
                        : "rgba(201,168,76,0.15)"
                    }`,
                  }}
                >
                  <ProductImageFallback
                    src={productThumbnailImage(img.url)}
                    alt={img.alt ?? productName}
                    label={img.alt ?? img.color ?? productName}
                    fill
                    sizes="80px"
                    imageClassName="object-contain p-2"
                    fallbackClassName="absolute inset-0"
                  />
                  {/* Indicateur couleur sous la miniature */}
                  {img.color && (
                    <span
                      className="absolute bottom-0 inset-x-0 text-[9px] font-medium
                                 text-center truncate px-1 py-0.5"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        color: isActive ? "#C9A84C" : "rgba(255,255,255,0.4)",
                      }}
                    >
                      {img.color}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Infos + sélecteur ───────────────────────────────────────── */}
      <div className="lg:sticky lg:top-24 lg:self-start space-y-6">
        {/* Bloc statique (titre, rating, prix initial, livraison, description) */}
        {infoSlot}

        {/* Sélecteur interactif */}
        <ProductVariantSelector
          productId={productId}
          variants={variants}
          locale={locale}
          storageOptions={storageOptions}
          colorOptions={colorOptions}
          labels={variantLabels}
          productImages={productImages}
          onImageChange={(url) => {
            if (url) setActiveImageUrl(url);
          }}
        />
      </div>
    </div>
  );
}
