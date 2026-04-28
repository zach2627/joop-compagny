// src/components/product/ProductCard.tsx
import Link from "next/link";
import Image from "next/image";
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
  };
  locale: Locale;
  labels: {
    sale: string;
    lowStock: string;
    outOfStock: string;
    viewProduct: (name: string) => string;
  };
}

export function ProductCard({ product, locale, labels }: ProductCardProps) {
  const isOnSale = product.compareAtPrice && product.compareAtPrice > product.price;
  const isOutOfStock = product.stockStatus === "OUT_OF_STOCK";
  const isLowStock = product.stockStatus === "LOW_STOCK";

  return (
    <Link
      href={localizedPath(`/store/products/${product.slug}`, locale)}
      className="group block"
      aria-label={labels.viewProduct(product.name)}
    >
      <div className="prod-card-inner">
        {/* Image */}
        <div
          className="relative aspect-square overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)" }}
        >
          {product.imageUrl ? (
            <Image
              src={productCardImage(product.imageUrl)}
              alt={product.imageAlt ?? product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-16 h-16" style={{ fill: "#2E2E2E" }}>
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
              </svg>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {isOnSale && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(220,38,38,0.15)", color: "#f87171", border: "1px solid rgba(220,38,38,0.25)" }}>
                {labels.sale}
              </span>
            )}
            {isLowStock && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(234,179,8,0.15)", color: "#EAB308", border: "1px solid rgba(234,179,8,0.25)" }}>
                {labels.lowStock}
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(107,114,128,0.15)", color: "#9CA3AF", border: "1px solid rgba(107,114,128,0.25)" }}>
                {labels.outOfStock}
              </span>
            )}
          </div>

          <div className="prod-accent" />
        </div>

        {/* Info */}
        <div className="p-5">
          <p className="text-xs mb-1 font-medium" style={{ color: "#C9A84C", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            {product.category}
          </p>
          <h3 className="prod-name text-sm font-bold mb-1.5 line-clamp-2">
            {product.name}
          </h3>
          {product.shortDescription && (
            <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
              {product.shortDescription}
            </p>
          )}
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tabular-nums" style={{ color: isOnSale ? "#C9A84C" : "#FFFFFF" }}>
              {formatXOF(product.price)}
            </span>
            {isOnSale && product.compareAtPrice && (
              <span className="text-xs tabular-nums line-through" style={{ color: "rgba(255,255,255,0.4)" }}>
                {formatXOF(product.compareAtPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
