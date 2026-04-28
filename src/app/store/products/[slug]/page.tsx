import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductPageSection } from "@/components/product/ProductPageSection";
import { ProductStructuredData } from "@/components/seo/ProductStructuredData";
import { seoConfig } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { getProductBySlug } from "@/features/products/service";
import { formatXOF } from "@/features/payment/paydunya";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import {
  translateProductContent,
  translateProductImageAlt,
  translateVariantName,
} from "@/lib/i18n/product-content";
import { translateCategory } from "@/lib/i18n/translations";

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const product = await getProductBySlug(params.slug);
  if (!product) {
    return {
      title: locale === "en" ? "Product not found" : "Produit introuvable",
    };
  }

  const productText = translateProductContent(locale, product);
  const title = productText.metaTitle ?? productText.name;
  const description =
    productText.metaDescription ??
    productText.shortDescription ??
    productText.description?.slice(0, 155) ??
    "";
  const canonicalUrl = `${seoConfig.siteUrl}${localizedPath(
    `/store/products/${params.slug}`,
    locale
  )}`;
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];

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
      images: product.images.map((image) => ({
        url: image.url,
        alt: translateProductImageAlt(locale, product.slug, image.alt, productText.name),
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

  const defaultVariant = product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
  const primaryImage = product.images.find((image) => image.isPrimary) ?? product.images[0];
  const productText = translateProductContent(locale, product);

  const avgRating =
    product.reviews.length > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        product.reviews.length
      : 0;

  const storageOptions = [...new Set(product.variants.map((variant) => variant.storage).filter(Boolean))];
  const colorOptions = [
    ...new Map(
      product.variants.map((variant) => [
        variant.color,
        { color: variant.color, hex: variant.colorHex },
      ])
    ).values(),
  ].filter((item) => item.color);

  const currentPrice = Number(defaultVariant?.price ?? product.basePrice);
  const inStock = (defaultVariant?.stock ?? 0) > 0;
  const categoryName = translateCategory(locale, product.category);

  return (
    <div style={{ background: "#0A0A08", minHeight: "100vh" }}>
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
        <nav
          className="mb-8 flex items-center gap-2 text-xs"
          style={{ color: "rgba(255,255,255,0.4)" }}
        >
          <Link
            href={localizedPath("/store/products", locale)}
            className="hover:underline"
            style={{ color: "#C9A84C" }}
          >
            {dict.products.breadcrumbProducts}
          </Link>
          <span>&gt;</span>
          <span style={{ color: "rgba(255,255,255,0.6)" }}>{categoryName}</span>
          <span>&gt;</span>
          <span style={{ color: "#FFFFFF" }}>{productText.name}</span>
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
          productImages={product.images.map((image) => ({
            id: image.id,
            url: image.url,
            alt: translateProductImageAlt(locale, product.slug, image.alt, productText.name),
            color: image.color ?? null,
          }))}
          variants={product.variants.map((variant) => ({
            id: variant.id,
            name: translateVariantName(locale, product.slug, variant.name),
            storage: variant.storage ?? undefined,
            color: variant.color ?? undefined,
            colorHex: variant.colorHex ?? undefined,
            price: Number(variant.price),
            compareAt: variant.compareAt ? Number(variant.compareAt) : undefined,
            stock: variant.stock,
            stockStatus: variant.stockStatus,
            isDefault: variant.isDefault,
          }))}
          storageOptions={storageOptions.filter((value): value is string => value !== null)}
          colorOptions={colorOptions.filter(
            (item): item is { color: string; hex: string | null } => item.color !== null
          )}
          variantLabels={{
            storage: dict.products.variant.storage,
            color: dict.products.variant.color,
            lowStock:
              locale === "en" ? "Only {stock} left in stock" : "Plus que {stock} en stock",
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
              <div
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest"
                style={{
                  background: "rgba(201,168,76,0.1)",
                  border: "1px solid rgba(201,168,76,0.25)",
                  color: "#C9A84C",
                }}
              >
                {categoryName}
              </div>

              <div>
                <h1 className="text-display-sm mb-2" style={{ color: "#FFFFFF" }}>
                  {productText.name}
                </h1>
                {productText.shortDescription ? (
                  <p className="text-lg" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {productText.shortDescription}
                  </p>
                ) : null}
              </div>

              {product.reviews.length > 0 ? (
                <div className="flex items-center gap-2">
                  <div className="flex" style={{ color: "#C9A84C" }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <span
                        key={star}
                        style={{ opacity: star <= Math.round(avgRating) ? 1 : 0.25 }}
                      >
                        *
                      </span>
                    ))}
                  </div>
                  <span className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {avgRating.toFixed(1)} ({product._count.reviews}{" "}
                    {locale === "en" ? "reviews" : "avis"})
                  </span>
                </div>
              ) : null}

              <div className="flex items-baseline gap-3">
                <span className="price-xl" style={{ color: "#C9A84C" }}>
                  {formatXOF(currentPrice)}
                </span>
                {defaultVariant?.compareAt ? (
                  <span
                    className="price-lg price-strike"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {formatXOF(Number(defaultVariant.compareAt))}
                  </span>
                ) : null}
              </div>

              <div
                className="rounded-apple-lg space-y-3 p-4"
                style={{
                  background: "#111109",
                  border: "1px solid rgba(201,168,76,0.15)",
                }}
              >
                {[
                  { index: "01", text: dict.products.details.delivery },
                  { index: "02", text: dict.products.details.payment },
                  { index: "03", text: dict.products.details.warranty },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-center gap-3 text-sm"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    <span style={{ color: "#C9A84C" }}>{item.index}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>

              {productText.description ? (
                <div>
                  <h3 className="mb-2 text-sm font-semibold" style={{ color: "#C9A84C" }}>
                    {dict.products.details.description}
                  </h3>
                  <p
                    className="whitespace-pre-line text-sm leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    {productText.description}
                  </p>
                </div>
              ) : null}
            </>
          }
        />

        {product.reviews.length > 0 ? (
          <section className="mt-20">
            <h2 className="mb-8 text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
              {dict.products.details.reviews(product._count.reviews)}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {product.reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-apple-lg p-5"
                  style={{
                    background: "#111109",
                    border: "1px solid rgba(201,168,76,0.1)",
                  }}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                        {review.user.name ?? dict.products.details.client}
                      </p>
                      <div className="mt-0.5 text-sm" style={{ color: "#C9A84C" }}>
                        {"*".repeat(review.rating)}
                        <span style={{ opacity: 0.25 }}>
                          {"*".repeat(5 - review.rating)}
                        </span>
                      </div>
                    </div>
                    {review.isVerified ? (
                      <span
                        className="rounded-full px-2 py-0.5 text-[10px]"
                        style={{
                          background: "rgba(201,168,76,0.15)",
                          color: "#C9A84C",
                        }}
                      >
                        {dict.products.details.verifiedPurchase}
                      </span>
                    ) : null}
                  </div>
                  {review.title ? (
                    <p className="mb-1 text-sm font-medium" style={{ color: "#FFFFFF" }}>
                      {review.title}
                    </p>
                  ) : null}
                  {review.body ? (
                    <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {review.body}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
