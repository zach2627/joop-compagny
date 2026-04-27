import Image from "next/image";
import Link from "next/link";
import { StoreBanner } from "@/components/layout/StoreBanner";
import { StoreFooter } from "@/components/layout/StoreFooter";
import { StoreNavbar } from "@/components/layout/StoreNavbar";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { siteConfig } from "@/config/site";
import { getFeaturedProducts, getCategories } from "@/features/products/service";
import { formatXOF } from "@/features/payment/paydunya";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/config";
import { heroBackgroundImage, productCardImage } from "@/lib/images/cloudinary";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import {
  translateProductContent,
  translateProductImageAlt,
} from "@/lib/i18n/product-content";
import { translateCategory } from "@/lib/i18n/translations";

export const revalidate = 60;

type FeaturedProduct = Awaited<ReturnType<typeof getFeaturedProducts>>[number];
type StoreCategory = Awaited<ReturnType<typeof getCategories>>[number];

const HOME_COPY: Record<
  Locale,
  {
    seasonLabel: string;
    storyLink: string;
    scrollLabel: string;
    selectionLabel: string;
    selectionCta: string;
    worldsLead: string;
    marqueeExtras: string[];
    categoryNarratives: Record<string, string>;
  }
> = {
  fr: {
    seasonLabel: "Collection printemps 2026",
    storyLink: "Notre histoire",
    scrollLabel: "Defiler",
    selectionLabel: "Selection maison",
    selectionCta: "Voir le produit",
    worldsLead:
      "Des silhouettes precieuses, des sillages memorables et des rituels d'interieur qui donnent au site une allure de maison plutot que de simple boutique.",
    marqueeExtras: [
      "Bijoux artisanaux",
      "Parfums d'orient",
      "Encens rares",
      "Livraison Dakar",
      "Paiement mobile",
    ],
    categoryNarratives: {
      bijoux:
        "Des pieces qui captent la lumiere et habillent le geste avec precision.",
      parfums:
        "Des sillages chauds et textures pour signer une presence sans hausser le ton.",
      encens:
        "Des rituels d'ambiance pour ancrer le calme, le soin et la memoire.",
      coffrets:
        "Des compositions prêtes a offrir, pensees comme des cadeaux signature.",
    },
  },
  en: {
    seasonLabel: "Spring collection 2026",
    storyLink: "Our story",
    scrollLabel: "Scroll",
    selectionLabel: "House selection",
    selectionCta: "View product",
    worldsLead:
      "Precious silhouettes, memorable scents and interior rituals give the homepage the feel of a house rather than a generic catalog.",
    marqueeExtras: [
      "Artisanal jewelry",
      "Oriental perfumes",
      "Rare incense",
      "Dakar delivery",
      "Mobile payment",
    ],
    categoryNarratives: {
      bijoux:
        "Pieces that catch light and refine a gesture with precision and warmth.",
      parfums:
        "Warm trails and layered textures designed to define a presence quietly.",
      encens:
        "Atmospheric rituals for calm, care and memory inside the home.",
      coffrets:
        "Gift-ready compositions arranged like signature house offerings.",
    },
  },
};

function getPrimaryImageUrl(product: FeaturedProduct | null | undefined) {
  return product?.images[0]?.url ?? null;
}

function getPrice(product: FeaturedProduct) {
  return Number(product.variants[0]?.price ?? product.basePrice);
}

export default async function HomePage() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  const home = dict.home;
  const copy = HOME_COPY[locale];
  const productListingHref = localizedPath("/store/products", locale);
  const secondaryHref = localizedPath("/store/products?category=coffrets", locale);

  const heroProducts = featured.slice(0, 3);
  const heroImageUrls = heroProducts
    .map((product) => getPrimaryImageUrl(product))
    .filter((value): value is string => Boolean(value));

  const featuredByCategory = new Map<string, FeaturedProduct>();
  for (const product of featured) {
    if (!featuredByCategory.has(product.category.slug)) {
      featuredByCategory.set(product.category.slug, product);
    }
  }

  const categoriesBySlug = new Map<string, StoreCategory>();
  for (const category of categories) {
    categoriesBySlug.set(category.slug, category);
  }

  const universeCards = siteConfig.navCategories
    .filter((slug) => slug !== "coffrets")
    .map((slug, index) => {
      const category = categoriesBySlug.get(slug);
      const showcase =
        featuredByCategory.get(slug) ??
        heroProducts[index % Math.max(heroProducts.length, 1)] ??
        featured[0] ??
        null;

      return {
        slug,
        category,
        showcase,
      };
    });

  const coffretShowcase = featuredByCategory.get("coffrets") ?? featured[0] ?? null;
  const coffretImageUrl = getPrimaryImageUrl(coffretShowcase);
  const marqueeItems = [...copy.marqueeExtras, ...home.highlights];

  return (
    <>
      <StoreBanner />
      <StoreNavbar />

      <main className="pt-[100px]">
        <style>{`
          @keyframes joop-home-marquee {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          .joop-home-marquee-track {
            display: flex;
            min-width: max-content;
            white-space: nowrap;
            will-change: transform;
            animation: joop-home-marquee 24s linear infinite;
          }
          .joop-home-marquee-track:hover {
            animation-play-state: paused;
          }
        `}</style>

        <section
          className="relative isolate overflow-hidden border-b"
          style={{
            minHeight: "calc(100vh - 100px)",
            background:
              "linear-gradient(180deg, #070605 0%, #0a0907 48%, #110d09 100%)",
            borderColor: "rgba(214,179,93,0.14)",
          }}
        >
          <div className="absolute inset-0">
            <HeroCarousel imageUrls={heroImageUrls} />
          </div>
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(7,6,5,0.4) 0%, rgba(7,6,5,0.18) 18%, rgba(7,6,5,0.72) 68%, rgba(7,6,5,0.96) 100%), radial-gradient(circle at 18% 22%, rgba(214,179,93,0.12), transparent 24%), radial-gradient(circle at 88% 16%, rgba(255,255,255,0.08), transparent 16%)",
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(214,179,93,0.32) 50%, transparent 100%)",
            }}
          />

          <div className="container-xl relative z-10 flex min-h-[calc(100vh-100px)] flex-col justify-between py-8 md:py-12">
            <div className="grid flex-1 items-end gap-10 lg:grid-cols-[minmax(0,1.15fr)_360px] lg:gap-14">
              <ScrollReveal>
                <div className="max-w-[760px] pt-8 md:pt-16">
                  <div
                    className="mb-8 inline-flex items-center gap-4 text-[11px] uppercase tracking-[0.34em]"
                    style={{ color: "rgba(214,179,93,0.9)" }}
                  >
                    <span
                      className="block h-px w-12"
                      style={{ background: "rgba(214,179,93,0.5)" }}
                    />
                    {copy.seasonLabel}
                  </div>

                  <h1
                    className="max-w-[12ch] text-balance"
                    style={{
                      color: "#f6f1e8",
                      fontSize: "clamp(3.6rem, 9vw, 7.8rem)",
                      lineHeight: 0.9,
                      letterSpacing: "-0.05em",
                      textShadow: "0 18px 42px rgba(0,0,0,0.45)",
                    }}
                  >
                    {home.heroTitle}
                  </h1>

                  <p
                    className="mt-5 max-w-[18ch]"
                    style={{
                      color: "#e0be67",
                      fontSize: "clamp(1.35rem, 3vw, 2.25rem)",
                      lineHeight: 1.02,
                      fontStyle: "italic",
                    }}
                  >
                    {home.heroAccent}
                  </p>

                  <p
                    className="mt-6 max-w-[680px] text-balance"
                    style={{
                      color: "rgba(235,226,212,0.84)",
                      fontSize: "clamp(1rem, 2vw, 1.18rem)",
                      lineHeight: 1.9,
                    }}
                  >
                    {home.heroBody}
                  </p>

                  <div className="mt-9 flex flex-wrap items-center gap-4">
                    <Link href={productListingHref} className="btn-primary">
                      {home.primaryCta}
                    </Link>
                    <Link href={secondaryHref} className="btn-secondary">
                      {home.secondaryCta}
                    </Link>
                    <Link
                      href="#signature"
                      className="inline-flex items-center gap-3 text-sm uppercase tracking-[0.24em]"
                      style={{ color: "rgba(235,226,212,0.74)" }}
                    >
                      <span
                        className="block h-px w-10"
                        style={{ background: "rgba(235,226,212,0.34)" }}
                      />
                      {copy.storyLink}
                    </Link>
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <aside
                  className="rounded-[30px] p-5 md:p-6"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(13,11,9,0.72) 0%, rgba(13,11,9,0.9) 100%)",
                    border: "1px solid rgba(214,179,93,0.18)",
                    backdropFilter: "blur(16px)",
                    boxShadow: "0 28px 60px rgba(0,0,0,0.28)",
                  }}
                >
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <div>
                      <p
                        className="text-[10px] uppercase tracking-[0.3em]"
                        style={{ color: "rgba(214,179,93,0.85)" }}
                      >
                        {copy.selectionLabel}
                      </p>
                      <p
                        className="mt-2 text-sm"
                        style={{ color: "rgba(235,226,212,0.66)" }}
                      >
                        {siteConfig.tagline}
                      </p>
                    </div>
                    <div
                      className="hidden h-10 w-10 items-center justify-center rounded-full md:flex"
                      style={{
                        border: "1px solid rgba(214,179,93,0.18)",
                        color: "#d6b35d",
                      }}
                    >
                      03
                    </div>
                  </div>

                  <div className="space-y-4">
                    {heroProducts.map((product) => {
                      const primaryImage = product.images[0];
                      const productText = translateProductContent(locale, product);

                      return (
                        <Link
                          key={product.id}
                          href={localizedPath(`/store/products/${product.slug}`, locale)}
                          className="grid grid-cols-[88px,1fr] gap-4 rounded-[22px] p-3 transition-transform duration-300 hover:-translate-y-1"
                          style={{
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <div
                            className="relative aspect-square overflow-hidden rounded-[18px]"
                            style={{ background: "rgba(255,255,255,0.02)" }}
                          >
                            {primaryImage ? (
                              <Image
                                src={productCardImage(primaryImage.url)}
                                alt={translateProductImageAlt(
                                  locale,
                                  product.slug,
                                  primaryImage.alt,
                                  productText.name
                                )}
                                fill
                                sizes="88px"
                                className="object-contain p-3"
                              />
                            ) : null}
                          </div>

                          <div className="min-w-0">
                            <p
                              className="text-[10px] uppercase tracking-[0.24em]"
                              style={{ color: "rgba(214,179,93,0.85)" }}
                            >
                              {translateCategory(locale, product.category)}
                            </p>
                            <h2
                              className="mt-2 text-xl text-balance"
                              style={{ color: "#f6f1e8", lineHeight: 1.02 }}
                            >
                              {productText.name}
                            </h2>
                            <p
                              className="mt-2 line-clamp-2 text-sm"
                              style={{ color: "rgba(235,226,212,0.68)" }}
                            >
                              {productText.shortDescription}
                            </p>
                            <div className="mt-3 flex items-center justify-between gap-3">
                              <span style={{ color: "#f6f1e8" }}>
                                {formatXOF(getPrice(product))}
                              </span>
                              <span
                                className="text-[10px] uppercase tracking-[0.24em]"
                                style={{ color: "#d6b35d" }}
                              >
                                {copy.selectionCta}
                              </span>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </aside>
              </ScrollReveal>
            </div>

            <div className="mt-8 flex items-center justify-between gap-6 pb-16 md:pb-20">
              <div
                className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.32em]"
                style={{ color: "rgba(235,226,212,0.62)" }}
              >
                <span
                  className="block h-px w-10"
                  style={{ background: "rgba(235,226,212,0.26)" }}
                />
                {copy.scrollLabel}
              </div>
              <div
                className="hidden text-[10px] uppercase tracking-[0.28em] md:block"
                style={{ color: "rgba(235,226,212,0.5)" }}
              >
                {siteConfig.address} / {home.paymentSubtitle}
              </div>
            </div>
          </div>

          <div
            className="absolute inset-x-0 bottom-0 overflow-hidden py-4"
            style={{
              background: "#d6b35d",
              color: "#080706",
              borderTop: "1px solid rgba(214,179,93,0.45)",
            }}
          >
            <div className="joop-home-marquee-track" aria-hidden="true">
              {[marqueeItems.join("  +  "), marqueeItems.join("  +  ")].map(
                (line, index) => (
                  <span
                    key={`${line}-${index}`}
                    className="px-8 text-[11px] font-semibold uppercase tracking-[0.34em]"
                  >
                    {line}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        <section id="signature" className="py-16 md:py-24">
          <div className="container-xl">
            <ScrollReveal>
              <div
                className="grid gap-8 rounded-[34px] p-6 md:grid-cols-[minmax(0,1.1fr)_380px] md:p-10"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(17,14,10,0.96) 0%, rgba(9,8,6,0.98) 100%)",
                  border: "1px solid rgba(214,179,93,0.12)",
                  boxShadow: "0 36px 80px rgba(0,0,0,0.28)",
                }}
              >
                <div>
                  <p
                    className="text-[11px] uppercase tracking-[0.32em]"
                    style={{ color: "#d6b35d" }}
                  >
                    {home.storyEyebrow}
                  </p>
                  <h2
                    className="mt-4 max-w-[12ch] text-balance"
                    style={{
                      color: "#f6f1e8",
                      fontSize: "clamp(2.5rem, 6vw, 4.7rem)",
                      lineHeight: 0.92,
                    }}
                  >
                    {home.storyTitle}
                  </h2>
                  <p
                    className="mt-6 max-w-[640px]"
                    style={{
                      color: "rgba(235,226,212,0.74)",
                      fontSize: "1.02rem",
                      lineHeight: 1.95,
                    }}
                  >
                    {home.storyBody}
                  </p>
                  <p
                    className="mt-6 max-w-[640px] text-sm"
                    style={{ color: "rgba(214,179,93,0.72)", lineHeight: 1.9 }}
                  >
                    {copy.worldsLead}
                  </p>

                  <div className="mt-8 grid gap-3 md:grid-cols-3">
                    {home.highlights.map((item: string, index: number) => (
                      <div
                        key={item}
                        className="rounded-[22px] p-4"
                        style={{
                          background:
                            index === 0
                              ? "rgba(214,179,93,0.08)"
                              : index === 1
                              ? "rgba(255,255,255,0.04)"
                              : "rgba(214,179,93,0.05)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <span
                          className="text-[10px] uppercase tracking-[0.24em]"
                          style={{ color: "#d6b35d" }}
                        >
                          0{index + 1}
                        </span>
                        <p
                          className="mt-3 text-sm leading-7"
                          style={{ color: "#f0e7d8" }}
                        >
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {coffretShowcase && coffretImageUrl ? (
                  <Link
                    href={localizedPath(`/store/products/${coffretShowcase.slug}`, locale)}
                    className="group rounded-[30px] p-4 transition-transform duration-300 hover:-translate-y-1"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(214,179,93,0.12)",
                    }}
                  >
                    <div className="relative aspect-[0.9] overflow-hidden rounded-[24px]">
                      <Image
                        src={heroBackgroundImage(coffretImageUrl)}
                        alt={translateProductImageAlt(
                          locale,
                          coffretShowcase.slug,
                          coffretShowcase.images[0]?.alt,
                          translateProductContent(locale, coffretShowcase).name
                        )}
                        fill
                        sizes="(max-width: 1024px) 100vw, 380px"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.62) 100%)",
                        }}
                      />
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <p
                          className="text-[10px] uppercase tracking-[0.26em]"
                          style={{ color: "#d6b35d" }}
                        >
                          {translateCategory(locale, coffretShowcase.category)}
                        </p>
                        <h3
                          className="mt-3 text-3xl text-balance"
                          style={{ color: "#f6f1e8", lineHeight: 1 }}
                        >
                          {translateProductContent(locale, coffretShowcase).name}
                        </h3>
                        <p
                          className="mt-3 text-sm"
                          style={{ color: "rgba(235,226,212,0.72)", lineHeight: 1.8 }}
                        >
                          {
                            translateProductContent(locale, coffretShowcase)
                              .shortDescription
                          }
                        </p>
                        <div className="mt-5 flex items-center justify-between gap-4">
                          <span style={{ color: "#f6f1e8" }}>
                            {formatXOF(getPrice(coffretShowcase))}
                          </span>
                          <span
                            className="text-[10px] uppercase tracking-[0.24em]"
                            style={{ color: "#d6b35d" }}
                          >
                            {home.buy}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : null}
              </div>
            </ScrollReveal>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container-xl">
            <ScrollReveal>
              <div className="mb-8 md:mb-10">
                <p
                  className="text-[11px] uppercase tracking-[0.32em]"
                  style={{ color: "#d6b35d" }}
                >
                  {home.catalogEyebrow}
                </p>
                <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-end">
                  <h2
                    className="max-w-[10ch] text-balance"
                    style={{
                      color: "#f6f1e8",
                      fontSize: "clamp(2.6rem, 6vw, 5rem)",
                      lineHeight: 0.92,
                    }}
                  >
                    {home.catalogTitle}
                  </h2>
                  <p
                    className="max-w-[560px] text-sm md:justify-self-end"
                    style={{ color: "rgba(235,226,212,0.7)", lineHeight: 1.9 }}
                  >
                    {copy.worldsLead}
                  </p>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid gap-5 lg:grid-cols-3">
              {universeCards.map(({ slug, category, showcase }, index) => {
                const productText = showcase
                  ? translateProductContent(locale, showcase)
                  : null;
                const imageUrl = getPrimaryImageUrl(showcase);

                return (
                  <ScrollReveal key={slug} delay={index * 90}>
                    <Link
                      href={localizedPath(`/store/products?category=${slug}`, locale)}
                      className="group relative block min-h-[420px] overflow-hidden rounded-[32px]"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(17,14,10,0.9) 0%, rgba(9,8,6,0.98) 100%)",
                        border: "1px solid rgba(214,179,93,0.12)",
                      }}
                    >
                      {imageUrl ? (
                        <>
                          <Image
                            src={heroBackgroundImage(imageUrl)}
                            alt={productText?.name ?? slug}
                            fill
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                          />
                          <div
                            className="absolute inset-0"
                            style={{
                              background:
                                "linear-gradient(180deg, rgba(7,6,5,0.08) 0%, rgba(7,6,5,0.34) 32%, rgba(7,6,5,0.86) 100%)",
                            }}
                          />
                        </>
                      ) : null}

                      <div className="relative z-10 flex h-full flex-col justify-between p-6">
                        <div className="flex items-start justify-between gap-4">
                          <span
                            className="inline-flex h-11 min-w-[44px] items-center justify-center rounded-full px-3 text-[10px] uppercase tracking-[0.28em]"
                            style={{
                              background: "rgba(7,6,5,0.56)",
                              color: "#d6b35d",
                              border: "1px solid rgba(214,179,93,0.16)",
                            }}
                          >
                            0{index + 1}
                          </span>
                          <span
                            className="text-[10px] uppercase tracking-[0.26em]"
                            style={{ color: "rgba(235,226,212,0.66)" }}
                          >
                            {category?._count.products ?? 0} {home.categoriesCount(category?._count.products ?? 0)}
                          </span>
                        </div>

                        <div>
                          <p
                            className="text-[10px] uppercase tracking-[0.26em]"
                            style={{ color: "#d6b35d" }}
                          >
                            {translateCategory(
                              locale,
                              category ?? { name: slug, slug }
                            )}
                          </p>
                          <h3
                            className="mt-3 text-4xl"
                            style={{ color: "#f6f1e8", lineHeight: 0.95 }}
                          >
                            {translateCategory(
                              locale,
                              category ?? { name: slug, slug }
                            )}
                          </h3>
                          <p
                            className="mt-4 max-w-[28ch] text-sm"
                            style={{
                              color: "rgba(235,226,212,0.74)",
                              lineHeight: 1.9,
                            }}
                          >
                            {copy.categoryNarratives[slug]}
                          </p>
                          {productText?.name ? (
                            <p
                              className="mt-5 text-[11px] uppercase tracking-[0.22em]"
                              style={{ color: "rgba(235,226,212,0.56)" }}
                            >
                              {productText.name}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container-xl">
            <ScrollReveal>
              <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
                <div>
                  <p
                    className="text-[11px] uppercase tracking-[0.32em]"
                    style={{ color: "#d6b35d" }}
                  >
                    {home.featuredEyebrow}
                  </p>
                  <h2
                    className="mt-4 max-w-[11ch] text-balance"
                    style={{
                      color: "#f6f1e8",
                      fontSize: "clamp(2.6rem, 6vw, 5rem)",
                      lineHeight: 0.92,
                    }}
                  >
                    {home.featuredTitle}
                  </h2>
                </div>
                <Link
                  href={productListingHref}
                  className="hidden text-[11px] uppercase tracking-[0.28em] md:block"
                  style={{ color: "#d6b35d" }}
                >
                  {home.viewAll}
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {featured.slice(0, 4).map((product, index) => {
                const primaryImage = product.images[0];
                const productText = translateProductContent(locale, product);

                return (
                  <ScrollReveal key={product.id} delay={index * 80}>
                    <Link
                      href={localizedPath(`/store/products/${product.slug}`, locale)}
                      className="group block h-full overflow-hidden rounded-[28px]"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(17,14,10,0.94) 0%, rgba(9,8,6,0.98) 100%)",
                        border: "1px solid rgba(214,179,93,0.12)",
                        boxShadow: "0 22px 54px rgba(0,0,0,0.18)",
                      }}
                    >
                      <div
                        className="relative aspect-[0.95] overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.03)" }}
                      >
                        {primaryImage ? (
                          <Image
                            src={productCardImage(primaryImage.url)}
                            alt={translateProductImageAlt(
                              locale,
                              product.slug,
                              primaryImage.alt,
                              productText.name
                            )}
                            fill
                            sizes="(max-width: 1280px) 50vw, 25vw"
                            className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : null}
                        <div
                          className="absolute inset-x-0 bottom-0 h-px"
                          style={{
                            background:
                              "linear-gradient(90deg, rgba(214,179,93,0.7), transparent)",
                          }}
                        />
                      </div>

                      <div className="p-5">
                        <div className="mb-4 flex items-center justify-between gap-4">
                          <p
                            className="text-[10px] uppercase tracking-[0.26em]"
                            style={{ color: "#d6b35d" }}
                          >
                            {translateCategory(locale, product.category)}
                          </p>
                          <span
                            className="text-[10px] uppercase tracking-[0.22em]"
                            style={{ color: "rgba(235,226,212,0.46)" }}
                          >
                            0{index + 1}
                          </span>
                        </div>
                        <h3
                          className="text-2xl text-balance"
                          style={{ color: "#f6f1e8", lineHeight: 1 }}
                        >
                          {productText.name}
                        </h3>
                        <p
                          className="mt-3 text-sm"
                          style={{
                            color: "rgba(235,226,212,0.7)",
                            lineHeight: 1.9,
                          }}
                        >
                          {productText.shortDescription}
                        </p>
                        <div className="mt-6 flex items-center justify-between gap-4">
                          <span style={{ color: "#f6f1e8" }}>
                            {formatXOF(getPrice(product))}
                          </span>
                          <span
                            className="text-[10px] uppercase tracking-[0.24em]"
                            style={{ color: "#d6b35d" }}
                          >
                            {home.buy}
                          </span>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>

            <div className="mt-6 md:hidden">
              <Link
                href={productListingHref}
                className="text-[11px] uppercase tracking-[0.28em]"
                style={{ color: "#d6b35d" }}
              >
                {home.viewAll}
              </Link>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container-xl">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_420px]">
              <ScrollReveal>
                <div
                  className="rounded-[32px] p-6 md:p-8"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(17,14,10,0.96) 0%, rgba(9,8,6,0.98) 100%)",
                    border: "1px solid rgba(214,179,93,0.12)",
                  }}
                >
                  <p
                    className="text-[11px] uppercase tracking-[0.32em]"
                    style={{ color: "#d6b35d" }}
                  >
                    {home.commitmentEyebrow}
                  </p>
                  <h2
                    className="mt-4 max-w-[12ch] text-balance"
                    style={{
                      color: "#f6f1e8",
                      fontSize: "clamp(2.4rem, 5.4vw, 4.4rem)",
                      lineHeight: 0.94,
                    }}
                  >
                    {home.commitmentTitle}
                  </h2>

                  <div className="mt-8 grid gap-4 md:grid-cols-3">
                    {home.reasons.map(
                      (reason: { title: string; desc: string }, index: number) => (
                        <div
                          key={reason.title}
                          className="rounded-[24px] p-5"
                          style={{
                            background:
                              index === 0
                                ? "rgba(214,179,93,0.08)"
                                : "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <span
                            className="text-[10px] uppercase tracking-[0.28em]"
                            style={{ color: "#d6b35d" }}
                          >
                            0{index + 1}
                          </span>
                          <h3
                            className="mt-4 text-2xl text-balance"
                            style={{ color: "#f6f1e8", lineHeight: 1 }}
                          >
                            {reason.title}
                          </h3>
                          <p
                            className="mt-4 text-sm"
                            style={{
                              color: "rgba(235,226,212,0.7)",
                              lineHeight: 1.9,
                            }}
                          >
                            {reason.desc}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={120}>
                <div
                  className="flex h-full flex-col justify-between rounded-[32px] p-6 md:p-8"
                  style={{
                    background:
                      "linear-gradient(160deg, rgba(214,179,93,0.16) 0%, rgba(17,14,10,0.98) 38%, rgba(9,8,6,0.98) 100%)",
                    border: "1px solid rgba(214,179,93,0.14)",
                  }}
                >
                  <div>
                    <p
                      className="text-[11px] uppercase tracking-[0.32em]"
                      style={{ color: "#d6b35d" }}
                    >
                      {home.paymentEyebrow}
                    </p>
                    <h2
                      className="mt-4 max-w-[11ch] text-balance"
                      style={{
                        color: "#f6f1e8",
                        fontSize: "clamp(2.2rem, 4vw, 3.8rem)",
                        lineHeight: 0.95,
                      }}
                    >
                      {home.paymentTitle}
                    </h2>
                    <p
                      className="mt-5 text-sm"
                      style={{
                        color: "rgba(235,226,212,0.72)",
                        lineHeight: 1.9,
                      }}
                    >
                      {home.paymentSubtitle}
                    </p>
                  </div>

                  <div className="my-8 space-y-3">
                    {[
                      { label: "Wave", hint: "Mobile money" },
                      { label: "Orange Money", hint: "Paiement local" },
                      { label: home.cashOnDelivery, hint: "Selon zone" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between gap-4 rounded-[20px] px-4 py-4"
                        style={{
                          background: "rgba(255,255,255,0.04)",
                          border: "1px solid rgba(255,255,255,0.06)",
                        }}
                      >
                        <span style={{ color: "#f6f1e8" }}>{item.label}</span>
                        <span
                          className="text-[10px] uppercase tracking-[0.22em]"
                          style={{ color: "#d6b35d" }}
                        >
                          {item.hint}
                        </span>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={productListingHref}
                    className="btn-primary w-full justify-center"
                  >
                    {home.primaryCta}
                  </Link>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        <StoreFooter />
      </main>
    </>
  );
}
