// src/components/product/ProductCard.tsx
import Link from "next/link";
import { formatXOF } from "@/features/payment/paydunya";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { productCardImage } from "@/lib/images/cloudinary";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";

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
          style={{ background: "#1A1A14" }}
        >
          <ProductImageFallback
            src={productCardImage(product.imageUrl)}
            alt={product.imageAlt ?? product.name}
            label={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            imageClassName="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
            fallbackClassName="absolute inset-0"
          />

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
                style={{ background: "rgba(201,168,76,0.12)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.28)" }}>
                {labels.lowStock}
              </span>
            )}
            {isOutOfStock && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                style={{ background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}>
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
