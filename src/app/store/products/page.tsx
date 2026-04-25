// src/app/store/products/page.tsx
import Link from "next/link";
import type { Metadata } from "next";
import { getProducts, getCategories } from "@/features/products/service";
import { productFilterSchema } from "@/lib/validation/schemas";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSort } from "@/components/product/ProductSort";
import { categoryMeta, seoConfig } from "@/config/seo";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import { translateCategory } from "@/lib/i18n/translations";
import {
  translateProductContent,
  translateProductImageAlt,
} from "@/lib/i18n/product-content";

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

  const filters = productFilterSchema.parse({
    ...rawFilters,
    sort: rawFilters.sort && ALLOWED_SORTS.has(rawFilters.sort) ? rawFilters.sort : undefined,
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
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>
      <div className="container-xl py-8">
        <div className="mb-8">
          <p
            className="text-xs font-semibold tracking-widest uppercase mb-2"
            style={{ color: "#C9A84C" }}
          >
            {currentCategoryName ?? dict.products.catalog}
          </p>
          <h1 className="text-display-md" style={{ color: "#FFFFFF" }}>
            {currentCategoryName ?? dict.products.allProducts}
          </h1>
          <p className="mt-1" style={{ color: "#6e6e73" }}>
            {dict.products.count(total)}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-[220px] shrink-0">
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

          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm" style={{ color: "#6e6e73" }}>
                {dict.products.page(filters.page, pages)}
              </p>
              <ProductSort labels={dict.products.sort} />
            </div>

            {products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-lg" style={{ color: "#6e6e73" }}>
                  {dict.products.none}
                </p>
                <p className="text-sm mt-2" style={{ color: "#515154" }}>
                  {dict.products.adjustFilters}
                </p>
              </div>
            ) : (
                <div className="product-grid">
                  {products.map((product) => {
                  const defaultVariant = getDefaultVariant(product);
                  const primaryImage = product.images[0];
                  const productText = translateProductContent(locale, product);

                  return (
                    <ProductCard
                      key={product.id}
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
                      }}
                      locale={locale}
                      labels={{
                        sale: dict.products.sale,
                        lowStock: dict.products.lowStock,
                        outOfStock: dict.products.outOfStock,
                        viewProduct: dict.products.viewProduct,
                      }}
                    />
                  );
                })}
              </div>
            )}

            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-12">
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
                      className="w-9 h-9 rounded-full text-sm font-medium flex items-center justify-center transition-all duration-200"
                      style={
                        page === filters.page
                          ? { background: "linear-gradient(135deg, #C9A84C, #E8C97A)", color: "#1A1A1A" }
                          : { color: "#86868b", border: "1px solid #2E2E2E" }
                      }
                    >
                      {page}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
