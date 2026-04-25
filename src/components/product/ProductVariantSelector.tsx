// src/components/product/ProductVariantSelector.tsx
"use client";

import { useState, useTransition, useEffect } from "react";
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
  /** Couleur correspondante (même valeur que Variant.color) */
  color: string | null;
}

interface ProductVariantSelectorProps {
  productId: string;
  variants: Variant[];
  storageOptions: string[];
  colorOptions: { color: string; hex: string | null }[];
  /** Images du produit avec leur couleur associée */
  productImages?: ProductImage[];
  locale: Locale;
  /** Appelé chaque fois que la variante active change — permet au parent de
   *  mettre à jour l'image affichée */
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

  // Variante correspondant à la sélection courante
  const selectedVariant =
    variants.find(
      (v) =>
        (storageOptions.length === 0 || v.storage === selectedStorage) &&
        (colorOptions.length === 0 || v.color === selectedColor)
    ) ?? defaultVariant;

  const isOutOfStock = selectedVariant?.stockStatus === "OUT_OF_STOCK";
  const isLowStock = selectedVariant?.stockStatus === "LOW_STOCK";

  // Trouver l'image qui correspond à la couleur sélectionnée.
  // Stratégie : correspondance exacte sur color, sinon image principale (null color).
  function findImageForColor(color: string | undefined): string | null {
    if (!productImages.length) return null;
    if (color) {
      const exact = productImages.find(
        (img) => img.color?.toLowerCase() === color.toLowerCase()
      );
      if (exact) return exact.url;
    }
    // Fallback : première image sans association de couleur, ou première image
    return productImages.find((img) => !img.color)?.url ?? productImages[0]?.url ?? null;
  }

  // Notifier le parent chaque fois que la couleur sélectionnée change
  useEffect(() => {
    if (onImageChange) {
      onImageChange(findImageForColor(selectedColor));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColor]);

  // Notifier au montage avec la couleur de la variante par défaut
  useEffect(() => {
    if (onImageChange) {
      onImageChange(findImageForColor(defaultVariant?.color));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSetStorage = (s: string) => {
    setSelectedStorage(s);
    // Quand on change le stockage, garder la couleur si possible
    const matched = variants.find(
      (v) => v.storage === s && v.color === selectedColor
    );
    if (!matched) {
      // Choisir la première variante disponible pour ce stockage
      const first = variants.find((v) => v.storage === s);
      if (first?.color !== selectedColor) {
        setSelectedColor(first?.color);
      }
    }
  };

  const handleSetColor = (color: string) => {
    setSelectedColor(color);
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
      {/* Prix variante sélectionnée */}
      {selectedVariant && (
        <div className="flex items-baseline gap-3">
          <span className="price-xl text-apple-gray-900">
            {formatXOF(selectedVariant.price)}
          </span>
          {selectedVariant.compareAt &&
            selectedVariant.compareAt > selectedVariant.price && (
              <span className="price-lg price-strike">
                {formatXOF(selectedVariant.compareAt)}
              </span>
            )}
        </div>
      )}

      {/* Sélecteur stockage */}
      {storageOptions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-apple-gray-500 uppercase tracking-widest mb-2">
            {labels.storage} :{" "}
            <span className="normal-case text-apple-gray-900 font-medium">
              {selectedStorage}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {storageOptions.map((s) => (
              <button
                key={s}
                onClick={() => handleSetStorage(s)}
                className={`px-4 py-2 text-sm rounded-full border-2 transition-colors font-medium
                  ${
                    selectedStorage === s
                      ? "border-apple-gray-900 bg-apple-gray-900 text-white"
                      : "border-apple-gray-200 text-apple-gray-700 hover:border-apple-gray-400"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sélecteur couleur */}
      {colorOptions.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-apple-gray-500 uppercase tracking-widest mb-2">
            {labels.color} :{" "}
            <span className="normal-case text-apple-gray-900 font-medium">
              {selectedColor}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {colorOptions.map(({ color, hex }) => (
              <button
                key={color}
                onClick={() => handleSetColor(color)}
                title={color}
                className={`relative w-8 h-8 rounded-full border-2 transition-all
                  ${
                    selectedColor === color
                      ? "border-apple-gray-900 scale-110"
                      : "border-apple-gray-200"
                  }`}
                style={{ backgroundColor: hex ?? "#ccc" }}
                aria-label={color}
                aria-pressed={selectedColor === color}
              >
                {selectedColor === color && (
                  <span className="absolute inset-0.5 rounded-full border-2 border-white" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* État du stock */}
      {isLowStock && (
        <p className="text-sm text-amber-600 font-medium">
          ⚠️ {labels.lowStock.replace("{stock}", String(selectedVariant?.stock ?? 0))}
        </p>
      )}
      {isOutOfStock && (
        <p className="text-sm text-red-600 font-medium">❌ {labels.outOfStock}</p>
      )}

      {/* Quantité */}
      {!isOutOfStock && (
        <div className="flex items-center gap-3">
          <p className="text-xs font-semibold text-apple-gray-500 uppercase tracking-widest">
            {labels.quantity} :
          </p>
          <div className="flex items-center border border-apple-gray-200 rounded-full overflow-hidden">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="w-9 h-9 flex items-center justify-center text-lg hover:bg-apple-gray-100 transition-colors"
              aria-label={labels.decrease}
            >
              −
            </button>
            <span className="w-10 text-center text-sm font-medium">{quantity}</span>
            <button
              onClick={() =>
                setQuantity(Math.min(selectedVariant?.stock ?? 10, quantity + 1))
              }
              className="w-9 h-9 flex items-center justify-center text-lg hover:bg-apple-gray-100 transition-colors"
              aria-label={labels.increase}
            >
              +
            </button>
          </div>
        </div>
      )}

      {/* Ajouter au panier */}
      <div className="flex flex-col gap-3">
        <button
          onClick={handleAddToCart}
          disabled={isPending || isOutOfStock || !selectedVariant}
          className={`btn-primary w-full py-4 text-base transition-all
            ${success ? "bg-green-600 hover:bg-green-700" : ""}`}
        >
          {isPending
            ? labels.adding
            : success
            ? labels.added
            : isOutOfStock
            ? labels.outOfStock
            : labels.add}
        </button>

        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
      </div>
    </div>
  );
}
