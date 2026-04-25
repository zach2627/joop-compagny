// src/components/product/ProductPageSection.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { ProductVariantSelector, type ProductImage } from "./ProductVariantSelector";
import type { Locale } from "@/lib/i18n/config";
import {
  productDetailImage,
  productThumbnailImage,
} from "@/lib/images/cloudinary";

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
            background: "#1A1A1A",
            border: "1px solid rgba(201,168,76,0.15)",
          }}
        >
          {activeImageUrl ? (
            <Image
              key={activeImageUrl}          /* force re-render on change */
              src={productDetailImage(activeImageUrl)}
              alt={
                productImages.find((i) => i.url === activeImageUrl)?.alt ??
                primaryImageAlt
              }
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-contain p-8 transition-opacity duration-300"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                className="w-24 h-24"
                style={{ fill: "#2E2E2E" }}
              >
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </div>
          )}
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
                    background: "#1A1A1A",
                    border: `2px solid ${
                      isActive
                        ? "rgba(201,168,76,0.8)"
                        : "rgba(201,168,76,0.15)"
                    }`,
                  }}
                >
                  <Image
                    src={productThumbnailImage(img.url)}
                    alt={img.alt ?? productName}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                  {/* Indicateur couleur sous la miniature */}
                  {img.color && (
                    <span
                      className="absolute bottom-0 inset-x-0 text-[9px] font-medium
                                 text-center truncate px-1 py-0.5"
                      style={{
                        background: "rgba(0,0,0,0.6)",
                        color: isActive ? "#C9A84C" : "#86868b",
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
