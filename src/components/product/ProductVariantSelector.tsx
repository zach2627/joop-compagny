// src/components/product/ProductVariantSelector.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { formatXOF } from "@/features/payment/paydunya";
import { addToCartAction } from "@/features/cart/actions";
import type { Locale } from "@/lib/i18n/config";

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

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  color: string | null;
}

interface ProductVariantSelectorProps {
  productId: string;
  variants: Variant[];
  storageOptions: string[];
  colorOptions: { color: string; hex: string | null }[];
  productImages?: ProductImage[];
  locale: Locale;
  onImageChange?: (imageUrl: string | null) => void;
  labels: {
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
}

export function ProductVariantSelector({
  productId,
  variants,
  storageOptions,
  colorOptions,
  productImages = [],
  locale,
  onImageChange,
  labels,
}: ProductVariantSelectorProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const defaultVariant = variants.find((v) => v.isDefault) ?? variants[0];
  const [selectedStorage, setSelectedStorage] = useState(defaultVariant?.storage);
  const [selectedColor, setSelectedColor] = useState(defaultVariant?.color);

  const selectedVariant =
    variants.find(
      (v) =>
        (storageOptions.length === 0 || v.storage === selectedStorage) &&
        (colorOptions.length === 0 || v.color === selectedColor)
    ) ?? defaultVariant;

  const isOutOfStock = selectedVariant?.stockStatus === "OUT_OF_STOCK";
  const isLowStock = selectedVariant?.stockStatus === "LOW_STOCK";

  function findImageForColor(color: string | undefined): string | null {
    if (!productImages.length) return null;
    if (color) {
      const exact = productImages.find(
        (img) => img.color?.toLowerCase() === color.toLowerCase()
      );
      if (exact) return exact.url;
    }

    return productImages.find((img) => !img.color)?.url ?? productImages[0]?.url ?? null;
  }

  useEffect(() => {
    if (onImageChange) {
      onImageChange(findImageForColor(selectedColor));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor]);

  useEffect(() => {
    if (onImageChange) {
      onImageChange(findImageForColor(defaultVariant?.color));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetStorage = (storage: string) => {
    setSelectedStorage(storage);
    const matched = variants.find((v) => v.storage === storage && v.color === selectedColor);
    if (!matched) {
      const first = variants.find((v) => v.storage === storage);
      if (first?.color !== selectedColor) {
        setSelectedColor(first?.color);
      }
    }
  };

  const handleAddToCart = () => {
    if (!selectedVariant) return;
    setError(null);
    setSuccess(false);

    const formData = new FormData();
    formData.set("productId", productId);
    formData.set("variantId", selectedVariant.id);
    formData.set("quantity", quantity.toString());
    formData.set("locale", locale);

    startTransition(async () => {
      const result = await addToCartAction(formData);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div className="space-y-5">
      {selectedVariant && (
        <div className="flex items-baseline gap-3">
          <span className="price-xl text-white">{formatXOF(selectedVariant.price)}</span>
          {selectedVariant.compareAt && selectedVariant.compareAt > selectedVariant.price && (
            <span className="price-lg price-strike">{formatXOF(selectedVariant.compareAt)}</span>
          )}
        </div>
      )}

      {storageOptions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-apple-gray-500">
            {labels.storage} : <span className="normal-case font-medium text-white">{selectedStorage}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {storageOptions.map((storage) => (
              <button
                key={storage}
                onClick={() => handleSetStorage(storage)}
                className={`rounded-full border-2 px-4 py-2 text-sm font-medium transition-colors ${
                  selectedStorage === storage
                    ? "border-apple-blue bg-[rgba(201,168,76,0.12)] text-white"
                    : "border-apple-gray-200 text-apple-gray-700 hover:border-apple-blue"
                }`}
              >
                {storage}
              </button>
            ))}
          </div>
        </div>
      )}

      {colorOptions.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-apple-gray-500">
            {labels.color} : <span className="normal-case font-medium text-white">{selectedColor}</span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(({ color, hex }) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                title={color}
                className={`relative h-8 w-8 rounded-full border-2 transition-all ${
                  selectedColor === color ? "scale-110 border-apple-blue" : "border-apple-gray-200"
                }`}
                style={{ backgroundColor: hex ?? "#C9A84C" }}
                aria-label={color}
                aria-pressed={selectedColor === color}
              >
                {selectedColor === color && (
                  <span className="absolute inset-0.5 rounded-full border-2 border-[#0A0A08]" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {isLowStock && (
        <p className="text-sm font-medium" style={{ color: "#C9A84C" }}>
          {labels.lowStock.replace("{stock}", String(selectedVariant?.stock ?? 0))}
        </p>
      )}

      {isOutOfStock && (
        <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>
          {labels.outOfStock}
        </p>
      )}

      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest text-apple-gray-500">
            {labels.quantity} :
          </p>
          <div className="flex items-center overflow-hidden rounded-full border border-apple-gray-200">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex h-9 w-9 items-center justify-center text-lg transition-colors hover:bg-[rgba(201,168,76,0.08)]"
              aria-label={labels.decrease}
            >
              -
            </button>
            <span className="w-10 text-center text-sm font-medium text-white">{quantity}</span>
            <button
              onClick={() => setQuantity(Math.min(selectedVariant?.stock ?? 10, quantity + 1))}
              className="flex h-9 w-9 items-center justify-center text-lg transition-colors hover:bg-[rgba(201,168,76,0.08)]"
              aria-label={labels.increase}
            >
              +
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isPending || isOutOfStock || !selectedVariant}
          className="btn-primary w-full py-4 text-base transition-all"
        >
          {isPending
            ? labels.adding
            : success
            ? labels.added
            : isOutOfStock
            ? labels.outOfStock
            : labels.add}
        </button>

        {error && (
          <p className="text-center text-sm" style={{ color: "#FFFFFF" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
