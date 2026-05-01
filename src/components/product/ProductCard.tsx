"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";
import { formatXOF } from "@/features/payment/paydunya";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { productCardImage } from "@/lib/images/cloudinary";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDescription?: string;
    imageUrl?: string;
    imageAlt?: string;
    price: number;
    compareAtPrice?: number;
    category: string;
    stockStatus: string;
    ariaLabel: string;
  };
  locale: Locale;
  labels: {
    sale: string;
    lowStock: string;
    outOfStock: string;
  };
}

export function ProductCard({ product, locale, labels }: ProductCardProps) {
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";
  const isLowStock = product.stockStatus === "LOW_STOCK";

  return (
    <Link
      href={localizedPath(`/store/products/${product.slug}`, locale)}
      className="group block h-full"
      aria-label={product.ariaLabel}
    >
      <motion.div whileHover={{ y: -8, scale: 1.01 }} transition={{ duration: 0.35 }} className="prod-card-inner">
        <div
          className="relative overflow-hidden"
          style={{
            height: "240px",
            background:
              "linear-gradient(180deg, rgba(27,24,18,0.94) 0%, rgba(18,16,12,0.94) 100%)",
            flexShrink: 0,
          }}
        >
          <ProductImageFallback
            src={productCardImage(product.imageUrl)}
            alt={product.imageAlt ?? product.name}
            label={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            imageClassName="object-contain p-6 transition-transform duration-500 group-hover:scale-105"
            fallbackClassName="absolute inset-0"
          />

          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {isOnSale && (
              <span
                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{
                  background: "linear-gradient(135deg, #e8c97a 0%, #c9a84c 100%)",
                  color: "#0a0a08",
                  boxShadow: "0 10px 22px rgba(201,168,76,0.22)",
                }}
              >
                {labels.sale}
              </span>
            )}
            {isLowStock && (
              <span
                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{
                  background: "rgba(184,138,84,0.12)",
                  color: "var(--color-primary)",
                  border: "1px solid rgba(201,168,76,0.2)",
                }}
              >
                {labels.lowStock}
              </span>
            )}
            {isOutOfStock && (
              <span
                className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  color: "var(--color-text-secondary)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                {labels.outOfStock}
              </span>
            )}
          </div>

          <div className="prod-accent" />
        </div>

        <div className="p-5">
          <p
            className="mb-2 text-[10px] uppercase tracking-[0.28em]"
            style={{ color: "var(--color-primary-dark)" }}
          >
            {product.category}
          </p>
          <h3 className="prod-name mb-2 line-clamp-2 text-xl" style={{ lineHeight: 1.02 }}>
            {product.name}
          </h3>
          {product.shortDescription ? (
            <p
              className="mb-4 line-clamp-2 text-sm"
              style={{ color: "var(--color-text-secondary)", lineHeight: 1.8 }}
            >
              {product.shortDescription}
            </p>
          ) : null}
          <div className="flex items-center gap-3">
            <span
              className="text-base font-semibold tabular-nums"
              style={{ color: "var(--color-primary-dark)" }}
            >
              {formatXOF(product.price)}
            </span>
            {isOnSale && product.compareAtPrice && (
              <span
                className="text-xs tabular-nums line-through"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {formatXOF(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
