"use client";

import { useState } from "react";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";
import type { Locale } from "@/lib/i18n/config";
import {
  productDetailImage,
  productThumbnailImage,
} from "@/lib/images/cloudinary";
import { ProductVariantSelector, type ProductImage } from "./ProductVariantSelector";

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
  const [activeImageUrl, setActiveImageUrl] = useState<string | null>(primaryImageUrl);

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-16">
      <div className="space-y-4">
        <div
          className="relative aspect-square overflow-hidden rounded-[36px]"
          style={{
            background:
              "linear-gradient(180deg, rgba(17,17,9,0.96) 0%, rgba(10,10,8,0.94) 100%)",
            border: "1px solid rgba(201,168,76,0.14)",
            boxShadow: "0 26px 62px rgba(0,0,0,0.34)",
          }}
        >
          <ProductImageFallback
            src={productDetailImage(activeImageUrl)}
            alt={
              productImages.find((image) => image.url === activeImageUrl)?.alt ??
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

        {productImages.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
            {productImages.map((image) => {
              const isActive = image.url === activeImageUrl;

              return (
                <button
                  key={image.id}
                  onClick={() => setActiveImageUrl(image.url)}
                  title={image.alt ?? image.color ?? productName}
                  className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px] transition-all duration-200"
                  style={{
                    background: "rgba(17,17,9,0.92)",
                    border: `1.5px solid ${
                      isActive
                        ? "rgba(201,168,76,0.42)"
                        : "rgba(201,168,76,0.12)"
                    }`,
                    boxShadow: isActive
                      ? "0 18px 32px rgba(201,168,76,0.14)"
                      : "none",
                  }}
                >
                  <ProductImageFallback
                    src={productThumbnailImage(image.url)}
                    alt={image.alt ?? productName}
                    label={image.alt ?? image.color ?? productName}
                    fill
                    sizes="80px"
                    imageClassName="object-contain p-2"
                    fallbackClassName="absolute inset-0"
                  />
                  {image.color ? (
                    <span
                      className="absolute inset-x-0 bottom-0 truncate px-1 py-0.5 text-center text-[9px]"
                      style={{
                        background: "rgba(10,10,8,0.82)",
                        color: isActive
                          ? "var(--color-primary-dark)"
                          : "var(--color-text-tertiary)",
                      }}
                    >
                      {image.color}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="space-y-6 lg:sticky lg:top-28 lg:self-start">
        <div className="luxe-panel-strong p-6 md:p-7">{infoSlot}</div>
        <div className="luxe-panel p-6 md:p-7">
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
    </div>
  );
}
