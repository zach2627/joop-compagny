// src/app/store/products/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getProductBySlug } from "@/features/products/service";
import { formatXOF } from "@/features/payment/paydunya";
import { ProductPageSection } from "@/components/product/ProductPageSection";
import { ProductStructuredData } from "@/components/seo/ProductStructuredData";
import { seoConfig } from "@/config/seo";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import { translateCategory } from "@/lib/i18n/translations";
import {
  translateProductContent,
  translateProductImageAlt,
  translateVariantName,
} from "@/lib/i18n/product-content";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const product = await getProductBySlug(params.slug);
  if (!product) return { title: locale === "en" ? "Product not found" : "Produit introuvable" };

  const productText = translateProductContent(locale, product);
  const title = productText.metaTitle ?? productText.name;
  const description =
    productText.metaDescription ??
    productText.shortDescription ??
    productText.description?.slice(0, 155) ??
    "";
  const canonicalUrl = `${seoConfig.siteUrl}${localizedPath(`/store/products/${params.slug}`, locale)}`;
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      locale: dict.meta.locale,
      images: product.images.map((img) => ({
        url: img.url,
        alt: translateProductImageAlt(locale, product.slug, img.alt, productText.name),
      })),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage.url] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const product = await getProductBySlug(params.slug);
  if (!product) notFound();

  const defaultVariant = product.variants.find((v) => v.isDefault) ?? product.variants[0];
  const primaryImage = product.images.find((img) => img.isPrimary) ?? product.images[0];
  const productText = translateProductContent(locale, product);

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + r.rating, 0) / product.reviews.length
      : 0;

  const storageOptions = [...new Set(product.variants.map((v) => v.storage).filter(Boolean))];
  const colorOptions = [
    ...new Map(product.variants.map((v) => [v.color, { color: v.color, hex: v.colorHex }])).values(),
  ].filter((c) => c.color);

  const currentPrice = Number(defaultVariant?.price ?? product.basePrice);
  const inStock = (defaultVariant?.stock ?? 0) > 0;
  const categoryName = translateCategory(locale, product.category);

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>

      {/* Structured Data Schema.org */}
      <ProductStructuredData
        name={productText.name}
        description={
          productText.metaDescription ??
          productText.shortDescription ??
          productText.description?.slice(0, 155) ??
          productText.name
        }
        image={primaryImage?.url ?? ""}
        price={currentPrice}
        currency="XOF"
        slug={params.slug}
        locale={locale}
        inStock={inStock}
        brand={siteConfig.name}
        sku={defaultVariant?.id}
        rating={avgRating > 0 ? avgRating : undefined}
        reviewCount={product.reviews.length > 0 ? product.reviews.length : undefined}
      />

      <div className="container-xl py-12">

        {/* Breadcrumb */}
        <nav className="text-xs mb-8 flex items-center gap-2" style={{ color: "#6e6e73" }}>
          <Link href={localizedPath("/store/products", locale)} style={{ color: "#C9A84C" }} className="hover:underline">
            {dict.products.breadcrumbProducts}
          </Link>
          <span>›</span>
          <span style={{ color: "#6e6e73" }}>{categoryName}</span>
          <span>›</span>
          <span style={{ color: "#d2d2d7" }}>{productText.name}</span>
        </nav>

        <ProductPageSection
          productId={product.id}
          productName={productText.name}
          locale={locale}
          primaryImageUrl={primaryImage?.url ?? null}
          primaryImageAlt={translateProductImageAlt(
            locale,
            product.slug,
            primaryImage?.alt,
            productText.name
          )}
          productImages={product.images.map((img) => ({
            id: img.id,
            url: img.url,
            alt: translateProductImageAlt(locale, product.slug, img.alt, productText.name),
            color: img.color ?? null,
          }))}
          variants={product.variants.map((v) => ({
            id: v.id,
            name: translateVariantName(locale, product.slug, v.name),
            storage: v.storage ?? undefined,
            color: v.color ?? undefined,
            colorHex: v.colorHex ?? undefined,
            price: Number(v.price),
            compareAt: v.compareAt ? Number(v.compareAt) : undefined,
            stock: v.stock,
            stockStatus: v.stockStatus,
            isDefault: v.isDefault,
          }))}
          storageOptions={storageOptions.filter((s): s is string => s !== null)}
          colorOptions={colorOptions.filter(
            (c): c is { color: string; hex: string | null } => c.color !== null
          )}
          variantLabels={{
            storage: dict.products.variant.storage,
            color: dict.products.variant.color,
            lowStock:
              locale === "en"
                ? "Only {stock} left in stock"
                : "Plus que {stock} en stock",
            outOfStock: dict.products.variant.outOfStock,
            quantity: dict.products.variant.quantity,
            decrease: dict.products.variant.decrease,
            increase: dict.products.variant.increase,
            adding: dict.products.variant.adding,
            added: dict.products.variant.added,
            add: dict.products.variant.add,
          }}
          infoSlot={
            <>
              {/* Catégorie badge */}
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase"
                style={{ background: "rgba(201,168,76,0.1)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}>
                {categoryName}
              </div>

              {/* Titre */}
              <div>
                <h1 className="text-display-sm mb-2" style={{ color: "#FFFFFF" }}>{productText.name}</h1>
                {productText.shortDescription && (
                  <p className="text-lg" style={{ color: "#86868b" }}>{productText.shortDescription}</p>
                )}
              </div>

              {/* Rating */}
              {product.reviews.length > 0 && (
                <div className="flex items-center gap-2">
                  <div className="flex" style={{ color: "#C9A84C" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span key={star} style={{ opacity: star <= Math.round(avgRating) ? 1 : 0.25 }}>★</span>
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: "#6e6e73" }}>
                    {avgRating.toFixed(1)} ({product._count.reviews} {locale === "en" ? "reviews" : "avis"})
                  </span>
                </div>
              )}

              {/* Prix de base */}
              <div className="flex items-baseline gap-3">
                <span className="price-xl" style={{ color: "#C9A84C" }}>
                  {formatXOF(currentPrice)}
                </span>
                {defaultVariant?.compareAt && (
                  <span className="price-lg price-strike" style={{ color: "#515154" }}>
                    {formatXOF(Number(defaultVariant.compareAt))}
                  </span>
                )}
              </div>

              {/* Infos livraison */}
              <div className="rounded-apple-lg p-4 space-y-3"
                style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.15)" }}>
                {[
                  { icon: "🚀", text: dict.products.details.delivery },
                  { icon: "💳", text: dict.products.details.payment },
                  { icon: "✅", text: dict.products.details.warranty },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-3 text-sm" style={{ color: "#d2d2d7" }}>
                    <span>{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>

              {/* Description */}
              {productText.description && (
                <div>
                  <h3 className="text-sm font-semibold mb-2" style={{ color: "#C9A84C" }}>{dict.products.details.description}</h3>
                  <p className="text-sm whitespace-pre-line leading-relaxed" style={{ color: "#86868b" }}>
                    {productText.description}
                  </p>
                </div>
              )}
            </>
          }
        />

        {/* Avis */}
        {product.reviews.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-semibold mb-8" style={{ color: "#FFFFFF" }}>
              {dict.products.details.reviews(product._count.reviews)}
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="rounded-apple-lg p-5"
                  style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.1)" }}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                        {review.user.name ?? dict.products.details.client}
                      </p>
                      <div className="text-sm mt-0.5" style={{ color: "#C9A84C" }}>
                        {"★".repeat(review.rating)}
                        <span style={{ opacity: 0.25 }}>{"★".repeat(5 - review.rating)}</span>
                      </div>
                    </div>
                    {review.isVerified && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full"
                        style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                        {dict.products.details.verifiedPurchase}
                      </span>
                    )}
                  </div>
                  {review.title && (
                    <p className="text-sm font-medium mb-1" style={{ color: "#d2d2d7" }}>{review.title}</p>
                  )}
                  {review.body && (
                    <p className="text-sm" style={{ color: "#86868b" }}>{review.body}</p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
}
