import Link from "next/link";
import type { Metadata } from "next";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { categoryMeta, seoConfig } from "@/config/seo";
import { getCategories, getProducts } from "@/features/products/service";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import {
  translateProductContent,
  translateProductImageAlt,
} from "@/lib/i18n/product-content";
import { translateCategory } from "@/lib/i18n/translations";
import { productFilterSchema } from "@/lib/validation/schemas";

interface PageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

function getSingleValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

const ALLOWED_SORTS = new Set([
  "newest",
  "price_asc",
  "price_desc",
  "popular",
  "featured",
]);

type ProductsResult = Awaited<ReturnType<typeof getProducts>>;
type ProductListItem = ProductsResult["products"][number];

function getDefaultVariant(product: ProductListItem) {
  return product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const category = getSingleValue(searchParams.category);
  const meta = category ? categoryMeta[category] : null;

  const title =
    (locale === "en" ? meta?.titleEn : meta?.title) ?? dict.products.metadataTitle;
  const description =
    (locale === "en" ? meta?.descriptionEn : meta?.description) ??
    dict.products.metadataDescription;
  const canonicalPath = localizedPath(
    category ? `/store/products?category=${category}` : "/store/products",
    locale
  );
  const canonicalUrl = `${seoConfig.siteUrl}${canonicalPath}`;

  return {
    title: {
      absolute: title,
    },
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      locale: dict.meta.locale,
    },
  };
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const rawFilters = {
    category: getSingleValue(searchParams.category),
    minPrice: getSingleValue(searchParams.minPrice),
    maxPrice: getSingleValue(searchParams.maxPrice),
    color: getSingleValue(searchParams.color),
    storage: getSingleValue(searchParams.storage),
    inStock: getSingleValue(searchParams.inStock),
    sort: getSingleValue(searchParams.sort),
    page: getSingleValue(searchParams.page) ?? 1,
    limit: getSingleValue(searchParams.limit),
    q: getSingleValue(searchParams.q),
  };

  const parsedFilters = productFilterSchema.safeParse({
    ...rawFilters,
    sort: rawFilters.sort && ALLOWED_SORTS.has(rawFilters.sort) ? rawFilters.sort : undefined,
  });
  const filters = parsedFilters.success
    ? parsedFilters.data
    : productFilterSchema.parse({
        category: rawFilters.category,
        sort: rawFilters.sort && ALLOWED_SORTS.has(rawFilters.sort) ? rawFilters.sort : undefined,
        q: rawFilters.q,
      });

  const [{ products, total, pages }, categories] = await Promise.all([
    getProducts(filters),
    getCategories(),
  ]);
  const formatOptions = Array.from(
    new Set(
      [
        ...products.flatMap((product) =>
          product.variants
            .map((variant) => variant.storage)
            .filter((storage): storage is string => Boolean(storage))
        ),
        filters.storage,
      ].filter((storage): storage is string => Boolean(storage))
    )
  );
  const currentCategory = categories.find((category) => category.slug === filters.category);
  const currentCategoryName = currentCategory
    ? translateCategory(locale, currentCategory)
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(201,168,76,0.14), transparent 24%), linear-gradient(180deg, #0a0a08 0%, #15150f 100%)",
      }}
    >
      <div className="container-xl py-10 md:py-14">
        <ScrollReveal>
          <div className="mb-10 max-w-[760px]">
            <p className="luxe-kicker">{currentCategoryName ?? dict.products.catalog}</p>
            <h1
              className="mt-5 text-balance"
              style={{
                fontSize: "clamp(2.8rem, 5vw, 4.8rem)",
                lineHeight: 0.95,
              }}
            >
              {currentCategoryName ?? dict.products.allProducts}
            </h1>
            <p className="mt-4 max-w-[560px] text-base luxe-copy">
              {dict.products.count(total)}
            </p>
          </div>
        </ScrollReveal>

        <div className="flex flex-col gap-8 lg:flex-row">
          <aside className="shrink-0 lg:sticky lg:top-28 lg:w-[280px] lg:self-start">
            <ProductFilters
              categories={categories.map((category) => ({
                name: translateCategory(locale, category),
                slug: category.slug,
                count: category._count.products,
              }))}
              currentFilters={filters}
              resetHref={localizedPath("/store/products", locale)}
              formatOptions={formatOptions}
              labels={{
                category: dict.products.category,
                price: dict.products.price,
                storage: dict.products.storage,
                all: dict.products.all,
                inStockOnly: dict.products.inStockOnly,
                resetFilters: dict.products.resetFilters,
                priceRanges: [...dict.products.priceRanges],
              }}
            />
          </aside>

          <div className="min-w-0 flex-1">
            <ScrollReveal delay={80}>
              <div
                className="mb-6 flex flex-col gap-4 rounded-[28px] px-5 py-4 md:flex-row md:items-center md:justify-between"
                style={{
                  background: "rgba(17,17,9,0.84)",
                  border: "1px solid rgba(201,168,76,0.14)",
                  boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
                }}
              >
                <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
                  {dict.products.page(filters.page, pages)}
                </p>
                <ProductSort labels={dict.products.sort} />
              </div>
            </ScrollReveal>

            {products.length === 0 ? (
              <ScrollReveal delay={120}>
                <div
                  className="rounded-[34px] px-6 py-16 text-center"
                  style={{
                    background: "rgba(17,17,9,0.84)",
                    border: "1px solid rgba(201,168,76,0.14)",
                  }}
                >
                  <p className="text-lg" style={{ color: "var(--color-text-secondary)" }}>
                    {dict.products.none}
                  </p>
                  <p className="mt-2 text-sm" style={{ color: "var(--color-text-tertiary)" }}>
                    {dict.products.adjustFilters}
                  </p>
                </div>
              </ScrollReveal>
            ) : (
              <div className="product-grid">
                {products.map((product, index) => {
                  const defaultVariant = getDefaultVariant(product);
                  const primaryImage = product.images[0];
                  const productText = translateProductContent(locale, product);

                  return (
                    <ScrollReveal key={product.id} delay={index * 50}>
                      <ProductCard
                        product={{
                          id: product.id,
                          name: productText.name,
                          slug: product.slug,
                          shortDescription: productText.shortDescription ?? undefined,
                          imageUrl: primaryImage?.url,
                          imageAlt: translateProductImageAlt(
                            locale,
                            product.slug,
                            primaryImage?.alt,
                            productText.name
                          ),
                          price: Number(defaultVariant?.price ?? product.basePrice),
                          compareAtPrice: defaultVariant?.compareAt
                            ? Number(defaultVariant.compareAt)
                            : undefined,
                          category: translateCategory(locale, product.category),
                          stockStatus: defaultVariant?.stockStatus ?? "IN_STOCK",
                          ariaLabel: dict.products.viewProduct(productText.name),
                        }}
                        locale={locale}
                        labels={{
                          sale: dict.products.sale,
                          lowStock: dict.products.lowStock,
                          outOfStock: dict.products.outOfStock,
                        }}
                      />
                    </ScrollReveal>
                  );
                })}
              </div>
            )}

            {pages > 1 ? (
              <div className="mt-12 flex justify-center gap-2">
                {Array.from({ length: pages }, (_, index) => index + 1).map((page) => {
                  const pageQuery = new URLSearchParams({
                    ...Object.fromEntries(
                      Object.entries(searchParams).filter(([, value]) => typeof value === "string") as [
                        string,
                        string,
                      ][]
                    ),
                    page: page.toString(),
                  });

                  return (
                    <Link
                      key={page}
                      href={`?${pageQuery.toString()}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium transition-all duration-200"
                      style={
                        page === filters.page
                          ? {
                              background:
                                "linear-gradient(135deg, #e8c97a 0%, #c9a84c 100%)",
                              color: "#0a0a08",
                              boxShadow: "0 10px 22px rgba(201,168,76,0.2)",
                            }
                          : {
                              background: "rgba(17,17,9,0.84)",
                              color: "var(--color-text-secondary)",
                              border: "1px solid rgba(201,168,76,0.14)",
                            }
                      }
                    >
                      {page}
                    </Link>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
