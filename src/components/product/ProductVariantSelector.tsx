"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { addToCartAction } from "@/features/cart/actions";
import { formatXOF } from "@/features/payment/paydunya";
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
  const [wishlisted, setWishlisted] = useState(false);
  const { showToast } = useToast();

  const defaultVariant = variants.find((variant) => variant.isDefault) ?? variants[0];
  const [selectedStorage, setSelectedStorage] = useState(defaultVariant?.storage);
  const [selectedColor, setSelectedColor] = useState(defaultVariant?.color);

  const selectedVariant =
    variants.find(
      (variant) =>
        (storageOptions.length === 0 || variant.storage === selectedStorage) &&
        (colorOptions.length === 0 || variant.color === selectedColor)
    ) ?? defaultVariant;

  const isOutOfStock = selectedVariant?.stockStatus === "OUT_OF_STOCK";
  const isLowStock = selectedVariant?.stockStatus === "LOW_STOCK";

  function findImageForColor(color: string | undefined): string | null {
    if (!productImages.length) return null;

    if (color) {
      const exact = productImages.find(
        (image) => image.color?.toLowerCase() === color.toLowerCase()
      );
      if (exact) return exact.url;
    }

    return productImages.find((image) => !image.color)?.url ?? productImages[0]?.url ?? null;
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

  function handleSetStorage(storage: string) {
    setSelectedStorage(storage);
    const matched = variants.find(
      (variant) => variant.storage === storage && variant.color === selectedColor
    );

    if (!matched) {
      const first = variants.find((variant) => variant.storage === storage);
      if (first?.color !== selectedColor) {
        setSelectedColor(first?.color);
      }
    }
  }

  function handleAddToCart() {
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
        showToast({
          type: "success",
          title: labels.added,
          subtitle: `${selectedVariant.name} — ${formatXOF(selectedVariant.price)}`,
          action: {
            label: locale === "en" ? "View" : "Voir",
            href: "/store/cart",
          },
        });
      } else {
        setError(result.error);
        showToast({ type: "error", title: result.error });
      }
    });
  }

  return (
    <div className="space-y-5">
      {selectedVariant ? (
        <div className="flex items-baseline gap-3">
          <span className="price-xl" style={{ color: "var(--color-primary-dark)" }}>
            {formatXOF(selectedVariant.price)}
          </span>
          {selectedVariant.compareAt && selectedVariant.compareAt > selectedVariant.price ? (
            <span className="price-lg price-strike">
              {formatXOF(selectedVariant.compareAt)}
            </span>
          ) : null}
        </div>
      ) : null}

      {storageOptions.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
            {labels.storage} :{" "}
            <span className="normal-case font-medium" style={{ color: "var(--color-text)" }}>
              {selectedStorage}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {storageOptions.map((storage) => (
              <button
                key={storage}
                onClick={() => handleSetStorage(storage)}
                className="rounded-full border px-4 py-2 text-sm font-medium transition-colors"
                style={
                  selectedStorage === storage
                    ? {
                        borderColor: "#C9A84C",
                        background: "rgba(201,168,76,0.05)",
                        color: "var(--color-text)",
                      }
                    : {
                        borderColor: "rgba(201,168,76,0.16)",
                        color: "var(--color-text-secondary)",
                        background: "transparent",
                      }
                }
              >
                {storage}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {colorOptions.length > 0 ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
            {labels.color} :{" "}
            <span className="normal-case font-medium" style={{ color: "var(--color-text)" }}>
              {selectedColor}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(({ color, hex }) => (
              <button
                key={color}
                onClick={() => setSelectedColor(color)}
                title={color}
                className="relative h-8 w-8 rounded-full border-2 transition-all"
                style={{
                  borderColor:
                    selectedColor === color
                      ? "rgba(184,138,84,0.48)"
                      : "rgba(184,138,84,0.14)",
                  transform: selectedColor === color ? "scale(1.08)" : "scale(1)",
                  backgroundColor: hex ?? "#c9a84c",
                }}
                aria-label={color}
                aria-pressed={selectedColor === color}
              >
                {selectedColor === color ? (
                  <span
                    className="absolute inset-[3px] rounded-full border"
                    style={{ borderColor: "rgba(201,168,76,0.88)" }}
                  />
                ) : null}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {isLowStock ? (
        <p className="text-sm font-medium" style={{ color: "var(--color-primary-dark)" }}>
          {labels.lowStock.replace("{stock}", String(selectedVariant?.stock ?? 0))}
        </p>
      ) : null}

      {isOutOfStock ? (
        <p className="text-sm font-medium" style={{ color: "var(--color-text-secondary)" }}>
          {labels.outOfStock}
        </p>
      ) : null}

      {!isOutOfStock ? (
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-tertiary)" }}>
            {labels.quantity} :
          </p>
          <div
            className="flex items-center overflow-hidden rounded-full"
            style={{ border: "1px solid rgba(184,138,84,0.12)" }}
          >
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="flex h-9 w-9 items-center justify-center text-lg transition-colors"
              style={{ color: "var(--color-text)" }}
              aria-label={labels.decrease}
            >
              -
            </button>
            <span className="w-10 text-center text-sm font-medium" style={{ color: "var(--color-text)" }}>
              {quantity}
            </span>
            <button
              onClick={() => setQuantity(Math.min(selectedVariant?.stock ?? 10, quantity + 1))}
              className="flex h-9 w-9 items-center justify-center text-lg transition-colors"
              style={{ color: "var(--color-text)" }}
              aria-label={labels.increase}
            >
              +
            </button>
          </div>
        </div>
      ) : null}

      <div className="flex flex-col gap-3">
        <div className="flex gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isPending || isOutOfStock || !selectedVariant}
            className="btn-primary flex-1 py-4 text-base"
            style={{
              background:
                "linear-gradient(135deg, #C9A84C 0%, #E8C97A 50%, #C9A84C 100%)",
              color: "#0A0A08",
            }}
          >
            {isPending
              ? labels.adding
              : success
                ? labels.added
                : isOutOfStock
                  ? labels.outOfStock
                  : labels.add}
          </button>

          <button
            type="button"
            onClick={() => {
              const next = !wishlisted;
              setWishlisted(next);
              showToast({
                type: "info",
                title: next
                  ? locale === "en"
                    ? "Added to wishlist"
                    : "Ajoute aux favoris"
                  : locale === "en"
                    ? "Removed from wishlist"
                    : "Retire des favoris",
              });
            }}
            aria-label={locale === "en" ? "Add to wishlist" : "Ajouter aux favoris"}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full transition-all duration-300"
            style={{
              border: `1px solid ${wishlisted ? "#C9A84C" : "rgba(201,168,76,0.28)"}`,
              background: wishlisted ? "rgba(201,168,76,0.08)" : "transparent",
              color: wishlisted ? "#C9A84C" : "var(--color-text)",
            }}
          >
            <Heart
              className="h-5 w-5"
              fill={wishlisted ? "#C9A84C" : "none"}
              stroke={wishlisted ? "#C9A84C" : "currentColor"}
            />
          </button>
        </div>

        {error ? (
          <p className="text-center text-sm" style={{ color: "var(--color-text)" }}>
            {error}
          </p>
        ) : null}
      </div>
    </div>
  );
}
