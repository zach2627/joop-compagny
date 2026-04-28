// src/components/cart/CartItemRow.tsx
"use client";

import Link from "next/link";
import { useTransition } from "react";
import { updateCartItemAction } from "@/features/cart/actions";
import { formatXOF } from "@/features/payment/paydunya";
import { Trash2 } from "lucide-react";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { productThumbnailImage } from "@/lib/images/cloudinary";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";

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
    startTransition(async () => {
      await updateCartItemAction(formData);
    });
  };

  return (
    <div
      className={`flex items-start gap-4 rounded-2xl p-4 transition-opacity ${isPending ? "opacity-50" : ""}`}
      style={{ background: "#111109", border: "1px solid rgba(201,168,76,0.12)" }}
    >
      <Link
        href={localizedPath(`/store/products/${item.slug}`, locale)}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl"
        style={{ background: "#1A1A14" }}
      >
        <ProductImageFallback
          src={productThumbnailImage(item.imageUrl)}
          alt={item.productName}
          label={item.productName}
          fill
          imageClassName="object-contain p-2"
          fallbackClassName="absolute inset-0"
        />
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={localizedPath(`/store/products/${item.slug}`, locale)}
          className="line-clamp-2 text-sm font-semibold text-white transition-colors hover:text-[#C9A84C]"
        >
          {item.productName}
        </Link>
        <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
          {item.variantName}
        </p>
        <p className="mt-0.5 font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
          {labels.sku}: {item.sku}
        </p>

        <div className="mt-3 flex items-center justify-between">
          <div
            className="flex items-center overflow-hidden rounded-full"
            style={{ border: "1px solid rgba(201,168,76,0.2)" }}
          >
            <button
              onClick={() => update(item.quantity - 1)}
              disabled={isPending || item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center text-sm transition-colors hover:bg-[rgba(201,168,76,0.08)] disabled:opacity-30"
              style={{ color: "#C9A84C" }}
              aria-label={labels.decrease}
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-medium text-white">{item.quantity}</span>
            <button
              onClick={() => update(Math.min(item.maxStock, item.quantity + 1))}
              disabled={isPending || item.quantity >= item.maxStock}
              className="flex h-8 w-8 items-center justify-center text-sm transition-colors hover:bg-[rgba(201,168,76,0.08)] disabled:opacity-30"
              style={{ color: "#C9A84C" }}
              aria-label={labels.increase}
            >
              +
            </button>
          </div>

          <span className="text-sm font-bold tabular-nums" style={{ color: "#C9A84C" }}>
            {formatXOF(item.price * item.quantity)}
          </span>
        </div>
      </div>

      <button
        onClick={() => update(0)}
        disabled={isPending}
        className="rounded-lg p-2 transition-all hover:bg-[rgba(201,168,76,0.08)]"
        style={{ color: "rgba(255,255,255,0.4)" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#C9A84C")}
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.4)")
        }
        aria-label={labels.remove}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
