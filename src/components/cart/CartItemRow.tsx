"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";
import { updateCartItemAction } from "@/features/cart/actions";
import { formatXOF } from "@/features/payment/paydunya";
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

  function update(quantity: number) {
    const formData = new FormData();
    formData.set("cartItemId", item.id);
    formData.set("quantity", quantity.toString());
    formData.set("locale", locale);
    startTransition(async () => {
      await updateCartItemAction(formData);
    });
  }

  return (
    <div
      className={`flex items-start gap-4 rounded-[28px] p-4 transition-opacity ${isPending ? "opacity-50" : ""}`}
      style={{
        background: "rgba(17,17,9,0.84)",
        border: "1px solid rgba(201,168,76,0.12)",
        boxShadow: "0 18px 40px rgba(0,0,0,0.3)",
      }}
    >
      <Link
        href={localizedPath(`/store/products/${item.slug}`, locale)}
        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[22px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(17,17,9,0.96) 0%, rgba(10,10,8,0.94) 100%)",
        }}
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
          className="line-clamp-2 text-base font-semibold transition-colors"
          style={{ color: "var(--color-text)" }}
        >
          {item.productName}
        </Link>
        <p className="mt-1 text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {item.variantName}
        </p>
        <p className="mt-0.5 font-mono text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {labels.sku}: {item.sku}
        </p>

        <div className="mt-4 flex items-center justify-between gap-4">
          <div
            className="flex items-center overflow-hidden rounded-full"
            style={{ border: "1px solid rgba(201,168,76,0.16)" }}
          >
            <button
              onClick={() => update(item.quantity - 1)}
              disabled={isPending || item.quantity <= 1}
              className="flex h-8 w-8 items-center justify-center text-sm transition-colors disabled:opacity-30"
              style={{ color: "var(--color-primary-dark)" }}
              aria-label={labels.decrease}
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-medium" style={{ color: "var(--color-text)" }}>
              {item.quantity}
            </span>
            <button
              onClick={() => update(Math.min(item.maxStock, item.quantity + 1))}
              disabled={isPending || item.quantity >= item.maxStock}
              className="flex h-8 w-8 items-center justify-center text-sm transition-colors disabled:opacity-30"
              style={{ color: "var(--color-primary-dark)" }}
              aria-label={labels.increase}
            >
              +
            </button>
          </div>

          <span className="text-sm font-bold tabular-nums" style={{ color: "var(--color-primary-dark)" }}>
            {formatXOF(item.price * item.quantity)}
          </span>
        </div>
      </div>

      <button
        onClick={() => update(0)}
        disabled={isPending}
        className="rounded-full p-2 transition-all"
        style={{ color: "var(--color-text-tertiary)" }}
        aria-label={labels.remove}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
