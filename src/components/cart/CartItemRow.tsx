// src/components/cart/CartItemRow.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useTransition } from "react";
import { updateCartItemAction } from "@/features/cart/actions";
import { formatXOF } from "@/features/payment/paydunya";
import { Trash2 } from "lucide-react";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { productThumbnailImage } from "@/lib/images/cloudinary";

interface CartItemRowProps {
  item: {
    id: string;
    productName: string;
    variantName: string;
    sku: string;
    imageUrl?: string;
    price: number;
    quantity: number;
    maxStock: number;
    slug: string;
  };
  locale: Locale;
  labels: {
    sku: string;
    decrease: string;
    increase: string;
    remove: string;
  };
}

export function CartItemRow({ item, locale, labels }: CartItemRowProps) {
  const [isPending, startTransition] = useTransition();

  const update = (quantity: number) => {
    const formData = new FormData();
    formData.set("cartItemId", item.id);
    formData.set("quantity", quantity.toString());
    formData.set("locale", locale);
    startTransition(async () => { await updateCartItemAction(formData); });
  };

  return (
    <div
      className={`flex gap-4 items-start p-4 rounded-2xl transition-opacity ${isPending ? "opacity-50" : ""}`}
      style={{ background: "#111", border: "1px solid rgba(201,168,76,0.12)" }}
    >
      {/* Image */}
      <Link
        href={localizedPath(`/store/products/${item.slug}`, locale)}
        className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden"
        style={{ background: "#1A1A1A" }}
      >
        {item.imageUrl ? (
          <Image
            src={productThumbnailImage(item.imageUrl)}
            alt={item.productName}
            fill
            className="object-contain p-2"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-2xl" style={{ color: "#2E2E2E" }}>
            📦
          </div>
        )}
      </Link>

      {/* Détails */}
      <div className="flex-1 min-w-0">
        <Link
          href={localizedPath(`/store/products/${item.slug}`, locale)}
          className="text-sm font-semibold text-white hover:text-[#C9A84C] transition-colors line-clamp-2"
        >
          {item.productName}
        </Link>
        <p className="text-xs mt-0.5" style={{ color: "#6e6e73" }}>{item.variantName}</p>
        <p className="text-xs font-mono mt-0.5" style={{ color: "#3a3a3f" }}>{labels.sku}: {item.sku}</p>

        <div className="flex items-center justify-between mt-3">
          {/* Quantité */}
          <div className="flex items-center rounded-full overflow-hidden" style={{ border: "1px solid rgba(201,168,76,0.2)" }}>
            <button
              onClick={() => update(item.quantity - 1)}
              disabled={isPending || item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-sm transition-colors hover:bg-[rgba(201,168,76,0.08)] disabled:opacity-30"
              style={{ color: "#C9A84C" }}
              aria-label={labels.decrease}
            >
              −
            </button>
            <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
            <button
              onClick={() => update(Math.min(item.maxStock, item.quantity + 1))}
              disabled={isPending || item.quantity >= item.maxStock}
              className="w-8 h-8 flex items-center justify-center text-sm transition-colors hover:bg-[rgba(201,168,76,0.08)] disabled:opacity-30"
              style={{ color: "#C9A84C" }}
              aria-label={labels.increase}
            >
              +
            </button>
          </div>

          {/* Prix */}
          <span className="text-sm font-bold tabular-nums" style={{ color: "#C9A84C" }}>
            {formatXOF(item.price * item.quantity)}
          </span>
        </div>
      </div>

      {/* Supprimer */}
      <button
        onClick={() => update(0)}
        disabled={isPending}
        className="p-2 rounded-lg transition-all hover:bg-[rgba(220,38,38,0.1)]"
        style={{ color: "#3a3a3f" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#3a3a3f")}
        aria-label={labels.remove}
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
}
