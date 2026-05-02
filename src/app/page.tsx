import Link from "next/link";
import type { Metadata } from "next";
import { StoreBanner } from "@/components/layout/StoreBanner";
import { StoreFooter } from "@/components/layout/StoreFooter";
import { StoreNavbar } from "@/components/layout/StoreNavbar";
import { ProductCard } from "@/components/product/ProductCard";
import { HeroCarousel } from "@/components/ui/HeroCarousel";
import { GoldParticles, RotatingBorderAside } from "@/components/ui/HeroGlam";
import { ParallaxSection } from "@/components/ui/ParallaxSection";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { StaggerReveal } from "@/components/ui/StaggerReveal";
import { siteConfig } from "@/config/site";
import { seoConfig } from "@/config/seo";
import { getFeaturedProducts, getCategories } from "@/features/products/service";
import { formatXOF } from "@/features/payment/paydunya";
import type { Locale } from "@/lib/i18n/config";
import { localizedPath } from "@/lib/i18n/config";
import {
  editorialFeatureImage,
  heroBackgroundImage,
  productCardImage,
} from "@/lib/images/cloudinary";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import {
  translateProductContent,
  translateProductImageAlt,
} from "@/lib/i18n/product-content";
import { translateCategory } from "@/lib/i18n/translations";

export const revalidate = 60;

export async function generateMetadata(): Promise<Metadata> {
  const locale = getRequestLocale();
  const isEn = locale === "en";
  return {
    title: isEn ? seoConfig.defaultTitleEn : seoConfig.defaultTitle,
    description: isEn ? seoConfig.defaultDescriptionEn : seoConfig.defaultDescription,
    openGraph: {
      title: isEn ? seoConfig.defaultTitleEn : seoConfig.defaultTitle,
      description: isEn ? seoConfig.defaultDescriptionEn : seoConfig.defaultDescription,
      url: seoConfig.siteUrl,
      siteName: seoConfig.siteName,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: isEn ? seoConfig.defaultTitleEn : seoConfig.defaultTitle,
      description: isEn ? seoConfig.defaultDescriptionEn : seoConfig.defaultDescription,
      site: seoConfig.twitterHandle,
    },
  };
}

type FeaturedProduct = Awaited<ReturnType<typeof getFeaturedProducts>>[number];
type StoreCategory = Awaited<ReturnType<typeof getCategories>>[number];

const HOME_EDITORIAL: Record<
  Locale,
  {
    seasonLabel: string;
    signatureLabel: string;
    worldsIntro: string;
    atelierLabel: string;
    atelierTitle: string;
    atelierBody: string;
    conciergeLabel: string;
    conciergeTitle: string;
    conciergeBody: string;
    storyLink: string;
    scrollLabel: string;
    discoverLabel: string;
    categoryNarratives: Record<string, string>;
    categorySubtitles: Record<string, string>;
    marquee: string[];
  }
> = {
  fr: {
    seasonLabel: "Edition maison 2026",
    signatureLabel: "L'univers JOOP",
    worldsIntro:
      "Une boutique pensee comme une maison de senteurs et de cadeaux: plus editoriale, plus tactile, plus desirante.",
    atelierLabel: "Atelier",
    atelierTitle: "Une direction artistique qui traite chaque produit comme un geste de style.",
    atelierBody:
      "Des silhouettes dorees, des volumes aeriens et une mise en scene douce donnent a la boutique une allure de maison de parfum plutot que de simple catalogue.",
    conciergeLabel: "Conciergerie",
    conciergeTitle: "Des commandes pensees pour offrir, surprendre et faire durer l'impression.",
    conciergeBody:
      "Wave, Orange Money, livraison a Dakar et selections pretes a offrir pour garder une experience fluide du premier clic jusqu'au cadeau final.",
    storyLink: "Voir la signature",
    scrollLabel: "Entrer dans l'univers",
    discoverLabel: "Decouvrir la piece",
    categoryNarratives: {
      bijoux: "Des lignes lumineuses pour souligner la silhouette et le geste.",
      montres: "Des montres dorees qui habillent le poignet avec elegance et caractere.",
      parfums: "Des sillages chauds, poudres et memorables pour signer la presence.",
      encens: "Des rituels d'interieur qui installent calme, douceur et profondeur.",
      coffrets: "Des compositions deja pensees comme des cadeaux signature.",
    },
    categorySubtitles: {
      bijoux: "Eclat & preciosite",
      montres: "Temps & elegance",
      parfums: "Sillage & memoire",
      encens: "Rituel & quietude",
      coffrets: "Offrande & raffinement",
    },
    marquee: ["Rituels delicats", "Selections feminines", "Cadeaux signature", "Livraison Dakar"],
  },
  en: {
    seasonLabel: "House edition 2026",
    signatureLabel: "The JOOP universe",
    worldsIntro:
      "A boutique shaped like a house of scent and gifting: more editorial, more tactile, more desirable.",
    atelierLabel: "Atelier",
    atelierTitle: "An art direction that treats every product like a styling gesture.",
    atelierBody:
      "Golden notes, airy spacing and a soft stagecraft give the boutique the feel of a fragrance house rather than a generic catalog.",
    conciergeLabel: "Concierge",
    conciergeTitle: "Orders designed to gift, surprise and leave an impression that lasts.",
    conciergeBody:
      "Wave, Orange Money, Dakar delivery and gift-ready selections keep the experience smooth from first click to final presentation.",
    storyLink: "View the signature",
    scrollLabel: "Enter the universe",
    discoverLabel: "Discover the piece",
    categoryNarratives: {
      bijoux: "Luminous lines designed to refine posture, movement and glow.",
      montres: "Gold-tone watches that dress the wrist with elegance and character.",
      parfums: "Warm, powdery and memorable trails that define a presence.",
      encens: "Interior rituals that settle calm, softness and depth.",
      coffrets: "Gift compositions already arranged like signature offerings.",
    },
    categorySubtitles: {
      bijoux: "Radiance & preciosity",
      montres: "Time & elegance",
      parfums: "Trail & memory",
      encens: "Ritual & stillness",
      coffrets: "Offering & refinement",
    },
    marquee: ["Delicate rituals", "Feminine edits", "Signature gifts", "Dakar delivery"],
  },
};

const SIGNATURE_FEATURE_IMAGE =
  "https://res.cloudinary.com/dlfytqzpw/image/upload/v1777630989/ChatGPT_Image_1_mai_2026_12_21_30_kopaje.png";
const ATELIER_BACKGROUND_IMAGE = "/images/home/atelier-luxe.png";

function getPrimaryImageUrl(product: FeaturedProduct | null | undefined) {
  return product?.images[0]?.url ?? null;
}

function getPrice(product: FeaturedProduct) {
  return Number(product.variants[0]?.price ?? product.basePrice);
}

function getHeroImages(products: FeaturedProduct[]) {
  return products
    .map((product) => getPrimaryImageUrl(product))
    .filter((value): value is string => Boolean(value));
}

function buildWorlds(
  locale: Locale,
  categories: StoreCategory[],
  copy: (typeof HOME_EDITORIAL)[Locale]
) {
  const categoryMap = new Map(categories.map((category) => [category.slug, category]));

  return siteConfig.navCategories.map((slug) => {
    const category = categoryMap.get(slug) ?? null;
    const showcase = category?.products[0] ?? null;
    const showcaseText = showcase ? translateProductContent(locale, showcase) : null;
    const showcaseImageUrl = showcase?.images[0]?.url ?? null;

    return {
      slug,
      category,
      showcase,
      showcaseText,
      showcaseImageUrl,
      narrative: copy.categoryNarratives[slug],
      subtitle: copy.categorySubtitles[slug],
    };
  });
}

export default async function HomePage() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  const home = dict.home;
  const copy = HOME_EDITORIAL[locale];
  const productListingHref = localizedPath("/store/products", locale);
  const giftHref = localizedPath("/store/products?category=coffrets", locale);
  const heroProducts = featured.slice(0, 4);
  const heroImages = getHeroImages(heroProducts);
  const heroFeatured = heroProducts[0] ?? featured[0] ?? null;
  const worlds = buildWorlds(locale, categories, copy);
  const marqueeItems = [...copy.marquee, ...home.highlights];
  const stats = Object.values(home.stats);

  return (
    <>
      <StoreBanner />
      <StoreNavbar />

      <main className="pt-[116px]">
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0">
            <HeroCarousel imageUrls={heroImages} />
          </div>
          <div className="hero-overlay absolute inset-0" />
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            aria-hidden="true"
            style={{ opacity: 0.03 }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern id="arabesque" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <circle cx="40" cy="40" r="30" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
                <circle cx="40" cy="40" r="20" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
                <line x1="10" y1="40" x2="70" y2="40" stroke="#C9A84C" strokeWidth="0.5" />
                <line x1="40" y1="10" x2="40" y2="70" stroke="#C9A84C" strokeWidth="0.5" />
                <line x1="18.8" y1="18.8" x2="61.2" y2="61.2" stroke="#C9A84C" strokeWidth="0.5" />
                <line x1="61.2" y1="18.8" x2="18.8" y2="61.2" stroke="#C9A84C" strokeWidth="0.5" />
                <polygon points="40,12 47,33 70,33 52,47 58,68 40,55 22,68 28,47 10,33 33,33" fill="none" stroke="#C9A84C" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#arabesque)" />
          </svg>
          <GoldParticles />
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent 0%, rgba(184,138,84,0.45) 50%, transparent 100%)",
            }}
          />

          <div className="container-xl relative z-10 flex min-h-[calc(100vh-116px)] flex-col justify-between py-8 md:py-12">
            <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1.06fr)_420px] lg:gap-14">
              <ScrollReveal>
                <div className="max-w-[720px]">
                  <p className="luxe-kicker">{copy.seasonLabel}</p>
                  <div
                    className="mb-0 mt-4"
                    style={{
                      height: "1px",
                      width: "clamp(80px, 14vw, 160px)",
                      background:
                        "linear-gradient(90deg, rgba(201,168,76,0.9) 0%, rgba(232,201,122,0.4) 60%, transparent 100%)",
                    }}
                  />
                  <h1
                    className="mt-4 max-w-[11ch] text-balance"
                    style={{
                      fontSize: "clamp(3.6rem, 8vw, 7.3rem)",
                      lineHeight: 0.88,
                      textShadow:
                        "0 2px 18px rgba(201,168,76,0.22), 0 20px 44px rgba(0,0,0,0.36)",
                    }}
                  >
                    <span className="hero-title-shimmer">{home.heroTitle}</span>
                  </h1>
                  <p
                    className="mt-5 max-w-[17ch]"
                    style={{
                      color: "#C9A84C",
                      fontSize: "clamp(1.32rem, 2.6vw, 2.2rem)",
                      lineHeight: 1.05,
                      fontStyle: "italic",
                      fontFamily: "var(--font-cormorant), serif",
                      filter: "drop-shadow(0 0 10px rgba(201,168,76,0.35))",
                    }}
                  >
                    {home.heroAccent}
                  </p>
                  <p
                    className="mt-6 max-w-[620px] text-balance text-base md:text-lg"
                    style={{
                      color: "rgba(255,248,242,0.84)",
                      lineHeight: 1.95,
                    }}
                  >
                    {home.heroBody}
                  </p>

                  <div className="mt-10 flex flex-wrap items-center gap-4">
                    <Link href={productListingHref} className="btn-primary">
                      {home.primaryCta}
                    </Link>
                    <Link href={giftHref} className="btn-secondary">
                      {home.secondaryCta}
                    </Link>
                    <Link
                      href="#signature"
                      className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.28em]"
                      style={{ color: "rgba(255,248,242,0.8)" }}
                    >
                      <span
                        className="block h-px w-10"
                        style={{ background: "rgba(255,248,242,0.58)" }}
                      />
                      {copy.storyLink}
                    </Link>
                  </div>

                  <StaggerReveal className="mt-12 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {stats.map((item) => (
                      <div
                        key={item}
                        className="rounded-[24px] px-4 py-4"
                      style={{
                          background: "rgba(10,10,8,0.46)",
                          border: "1px solid rgba(201,168,76,0.14)",
                          backdropFilter: "blur(12px)",
                        }}
                      >
                        <p
                          className="text-[10px] uppercase tracking-[0.26em]"
                          style={{ color: "rgba(255,248,242,0.66)" }}
                        >
                          JOOP
                        </p>
                        <p
                          className="mt-3 text-sm"
                          style={{ color: "#fffdf8", lineHeight: 1.7 }}
                        >
                          {item}
                        </p>
                      </div>
                    ))}
                  </StaggerReveal>
                </div>
              </ScrollReveal>

              {heroFeatured ? (
                <ParallaxSection className="hidden lg:block" offset={34}>
                  <ScrollReveal delay={120}>
                    <RotatingBorderAside>
                    <aside
                      className="rounded-[34px] p-6"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(17,17,9,0.88) 0%, rgba(10,10,8,0.92) 100%)",
                        backdropFilter: "blur(18px)",
                        boxShadow: "0 28px 80px rgba(0,0,0,0.34)",
                      }}
                    >
                      <p
                        className="text-[10px] uppercase tracking-[0.28em]"
                        style={{ color: "rgba(255,248,242,0.66)" }}
                      >
                        {copy.signatureLabel}
                      </p>
                      <div
                        className="relative mt-5 aspect-[0.92] overflow-hidden rounded-[28px]"
                        style={{
                          background: "rgba(255,255,255,0.03)",
                          border: "1px solid rgba(201,168,76,0.12)",
                        }}
                      >
                        <ProductImageFallback
                          src={productCardImage(getPrimaryImageUrl(heroFeatured))}
                          alt={translateProductImageAlt(
                            locale,
                            heroFeatured.slug,
                            heroFeatured.images[0]?.alt,
                            translateProductContent(locale, heroFeatured).name
                          )}
                          label={translateProductContent(locale, heroFeatured).name}
                          fill
                          sizes="420px"
                          imageClassName="object-contain p-10"
                          fallbackClassName="absolute inset-0"
                        />
                      </div>
                      <div className="mt-6">
                        <p
                          className="text-[10px] uppercase tracking-[0.28em]"
                          style={{ color: "rgba(255,248,242,0.68)" }}
                        >
                          {translateCategory(locale, heroFeatured.category)}
                        </p>
                        <h2
                          className="mt-3 text-4xl"
                          style={{ color: "#fffdf8", lineHeight: 0.96 }}
                        >
                          {translateProductContent(locale, heroFeatured).name}
                        </h2>
                        <p
                          className="mt-4 text-sm"
                          style={{ color: "rgba(255,248,242,0.78)", lineHeight: 1.9 }}
                        >
                          {translateProductContent(locale, heroFeatured).shortDescription}
                        </p>
                        <div className="mt-6 flex items-center justify-between gap-4">
                          <span className="price-lg" style={{ color: "#fffdf8" }}>
                            {formatXOF(getPrice(heroFeatured))}
                          </span>
                          <Link
                            href={localizedPath(`/store/products/${heroFeatured.slug}`, locale)}
                            className="rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.24em]"
                            style={{
                              background: "rgba(255,255,255,0.04)",
                              color: "#fffdf8",
                              border: "1px solid rgba(201,168,76,0.16)",
                            }}
                          >
                            {copy.discoverLabel}
                          </Link>
                        </div>
                      </div>
                    </aside>
                    </RotatingBorderAside>
                  </ScrollReveal>
                </ParallaxSection>
              ) : null}
            </div>

            <div className="mt-10 flex items-center justify-between gap-6 pb-10 md:pb-14">
              <div
                className="inline-flex items-center gap-4 text-[10px] uppercase tracking-[0.3em]"
                style={{ color: "rgba(255,248,242,0.72)" }}
              >
                <span
                  className="block h-px w-10"
                  style={{ background: "rgba(255,248,242,0.46)" }}
                />
                {copy.scrollLabel}
              </div>
              <p
                className="hidden text-[10px] uppercase tracking-[0.28em] md:block"
                style={{ color: "rgba(255,248,242,0.56)" }}
              >
                {siteConfig.address} / {siteConfig.tagline}
              </p>
            </div>
          </div>

          {/* ── Marquee luxe double rangée ─────────────────────────── */}
          {(() => {
            const luxeItems = [
              "✦ Bijoux artisanaux · ",
              "✦ Parfums d'orient · ",
              "✦ Encens précieux · ",
              "✦ Livraison Dakar · ",
              "✦ Emballage cadeau · ",
              "✦ Paiement Wave & Orange Money · ",
              "✦ Sélection féminine · ",
              "✦ Maison Danita · ",
              "✦ Rituel & élégance · ",
            ];
            const track = [...luxeItems, ...luxeItems];
            return (
              <div
                style={{
                  background: "linear-gradient(90deg, #0A0A08, #1A1208, #0A0A08)",
                  borderTop: "0.5px solid rgba(201,168,76,0.3)",
                  borderBottom: "0.5px solid rgba(201,168,76,0.3)",
                  padding: "0.75rem 0",
                  overflow: "hidden",
                }}
              >
                <div className="joop-marquee-fwd" aria-hidden="true" style={{ marginBottom: "0.45rem" }}>
                  {track.map((item, i) => (
                    <span key={i} className="joop-marquee-item">{item}</span>
                  ))}
                </div>
                <div className="joop-marquee-rev" aria-hidden="true">
                  {track.map((item, i) => (
                    <span key={i} className="joop-marquee-item">{item}</span>
                  ))}
                </div>
              </div>
            );
          })()}
        </section>

        <style>{`
          @keyframes joop-marquee-forward {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @keyframes joop-marquee-reverse {
            from { transform: translateX(-50%); }
            to { transform: translateX(0); }
          }
          .joop-marquee-fwd,
          .joop-marquee-rev {
            display: flex;
            min-width: max-content;
            white-space: nowrap;
          }
          .joop-marquee-fwd {
            animation: joop-marquee-forward 32s linear infinite;
          }
          .joop-marquee-rev {
            animation: joop-marquee-reverse 32s linear infinite;
          }
          .joop-marquee-item {
            font-family: var(--font-cormorant), serif;
            font-style: italic;
            font-size: 0.85rem;
            letter-spacing: 0.3em;
            color: #C9A84C;
            padding: 0 0.5rem;
          }
        `}</style>

        <section id="signature" className="py-16 md:py-24">
          <div className="container-xl">
            <ParallaxSection offset={18}>
              <ScrollReveal>
                <div className="max-w-[1080px]">
                  <div
                    className="relative overflow-hidden rounded-[34px]"
                    style={{
                      border: "1px solid rgba(212,175,55,0.16)",
                      boxShadow: "0 28px 68px rgba(0,0,0,0.36)",
                      background:
                        "linear-gradient(180deg, rgba(17,17,9,0.96) 0%, rgba(10,10,8,0.94) 100%)",
                    }}
                  >
                    <div className="absolute inset-0">
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: `url(${editorialFeatureImage(SIGNATURE_FEATURE_IMAGE)})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center right",
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(90deg, rgba(10,10,8,0.88) 0%, rgba(10,10,8,0.76) 38%, rgba(10,10,8,0.58) 66%, rgba(10,10,8,0.74) 100%)",
                        }}
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg, rgba(10,10,8,0.18) 0%, rgba(10,10,8,0.26) 38%, rgba(10,10,8,0.82) 100%)",
                        }}
                      />
                    </div>

                    <div className="relative z-10 p-7 md:p-10 lg:p-12">
                      <div className="max-w-[680px]">
                        <div
                          className="inline-flex rounded-full px-4 py-2 text-[10px] uppercase tracking-[0.28em]"
                          style={{
                            color: "#d4af37",
                            background: "rgba(10,10,8,0.48)",
                            border: "1px solid rgba(212,175,55,0.18)",
                            backdropFilter: "blur(12px)",
                          }}
                        >
                          {home.storyEyebrow}
                        </div>

                        <p
                          className="mt-6 text-[11px] uppercase tracking-[0.3em]"
                          style={{ color: "rgba(212,175,55,0.92)" }}
                        >
                          {copy.signatureLabel}
                        </p>

                        <h2
                          className="mt-5 max-w-[10ch] text-balance"
                          style={{
                            fontSize: "clamp(2.8rem, 5.1vw, 4.9rem)",
                            lineHeight: 0.92,
                            color: "#FFFFFF",
                          }}
                        >
                          {home.storyTitle}
                        </h2>

                        <p
                          className="mt-6 max-w-[580px] text-base md:text-lg"
                          style={{
                            color: "#FFFFFF",
                            lineHeight: 1.9,
                          }}
                        >
                          {home.storyBody}
                        </p>

                        <p
                          className="mt-6 max-w-[580px] text-sm"
                          style={{
                            color: "rgba(255,255,255,0.72)",
                            lineHeight: 1.9,
                          }}
                        >
                          {copy.worldsIntro}
                        </p>
                      </div>

                      <StaggerReveal className="mt-10 grid gap-4 md:grid-cols-3">
                        {home.highlights.map((item: string, index: number) => (
                          <div
                            key={item}
                            className="rounded-[24px] px-5 py-5 md:px-6 md:py-6"
                            style={{
                              background: "rgba(10,10,8,0.46)",
                              border: "1px solid rgba(212,175,55,0.14)",
                              backdropFilter: "blur(14px)",
                            }}
                          >
                            <p
                              className="text-[10px] uppercase tracking-[0.28em]"
                              style={{ color: "rgba(212,175,55,0.88)" }}
                            >
                              0{index + 1}
                            </p>
                            <p
                              className="mt-4"
                              style={{
                                fontFamily: "var(--font-cormorant), serif",
                                fontSize: "clamp(1.45rem, 2.5vw, 1.9rem)",
                                lineHeight: 1.08,
                                color: "#FFFFFF",
                              }}
                            >
                              {item}
                            </p>
                          </div>
                        ))}
                      </StaggerReveal>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </ParallaxSection>
          </div>
        </section>

        <section className="py-14 md:py-22">
          <div className="container-xl">
            <ScrollReveal>
              <div className="mb-10 max-w-[760px]">
                <p className="luxe-kicker">{home.catalogEyebrow}</p>
                <h2
                  className="mt-5 max-w-[10ch] text-balance"
                  style={{
                    fontSize: "clamp(2.7rem, 5vw, 4.8rem)",
                    lineHeight: 0.94,
                  }}
                >
                  {home.catalogTitle}
                </h2>
                <p className="mt-5 text-base luxe-copy">{copy.worldsIntro}</p>
              </div>
            </ScrollReveal>

            <StaggerReveal className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
              {worlds.map(({ slug, category, showcase, showcaseText, showcaseImageUrl, narrative, subtitle }, index) => {
                const translatedCategory = translateCategory(
                  locale,
                  category ?? { name: slug, slug }
                );

                return (
                  <Link
                    key={slug}
                    href={localizedPath(`/store/products?category=${slug}`, locale)}
                    className="group relative flex flex-col overflow-hidden rounded-[34px] transition-transform duration-500 hover:-translate-y-1"
                    style={{
                      minHeight: "380px",
                      background:
                        "linear-gradient(180deg, rgba(16,16,12,0.96) 0%, rgba(10,10,8,0.94) 100%)",
                      border: "1px solid rgba(201,168,76,0.12)",
                      boxShadow: "0 26px 60px rgba(0,0,0,0.34)",
                    }}
                  >
                    {/* Motif décoratif — lignes courbes dorées, très subtiles */}
                    <div className="pointer-events-none absolute inset-0" style={{ opacity: 0.05 }}>
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern
                            id={`pat-${slug}`}
                            x="0" y="0" width="60" height="60"
                            patternUnits="userSpaceOnUse"
                          >
                            <path
                              d="M30 4 Q48 18 56 30 Q48 42 30 56 Q12 42 4 30 Q12 18 30 4Z"
                              fill="none" stroke="#C9A84C" strokeWidth="0.7"
                            />
                            <circle cx="30" cy="30" r="3" fill="none" stroke="#C9A84C" strokeWidth="0.5" />
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill={`url(#pat-${slug})`} />
                      </svg>
                    </div>

                    {/* Image produit showcase */}
                    {showcaseImageUrl ? (
                      <>
                        <div className="absolute inset-0 opacity-80">
                          <ProductImageFallback
                            src={heroBackgroundImage(showcaseImageUrl)}
                            alt={showcaseText?.name ?? translatedCategory}
                            label={showcaseText?.name ?? translatedCategory}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            imageClassName="object-cover transition-transform duration-700 group-hover:scale-105"
                            fallbackClassName="absolute inset-0"
                          />
                        </div>
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(10,10,8,0.14) 0%, rgba(10,10,8,0.72) 100%)",
                          }}
                        />
                      </>
                    ) : category?.imageUrl ? (
                      <>
                        <div className="absolute inset-0 opacity-80">
                          <ProductImageFallback
                            src={heroBackgroundImage(category.imageUrl)}
                            alt={translatedCategory}
                            label={translatedCategory}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            imageClassName="object-cover transition-transform duration-700 group-hover:scale-105"
                            fallbackClassName="absolute inset-0"
                          />
                        </div>
                        <div
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(10,10,8,0.14) 0%, rgba(10,10,8,0.72) 100%)",
                          }}
                        />
                      </>
                    ) : null}

                    {/* Dégradé doré subtil depuis le bas */}
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(201,168,76,0.06) 0%, transparent 55%)",
                      }}
                    />

                    {/* Bordure dorée animée en bas (0 → 100% au hover) */}
                    <div
                      className="absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                      style={{
                        background:
                          "linear-gradient(90deg, transparent, rgba(201,168,76,0.85), transparent)",
                      }}
                    />

                    <div className="relative z-10 flex flex-1 flex-col justify-between p-6 md:p-7">
                      {/* Ornement floral en haut à gauche + compteur produits */}
                      <div className="flex items-start justify-between gap-4">
                        <span
                          className="flex h-8 w-8 items-center justify-center rounded-full"
                          style={{
                            background: "rgba(201,168,76,0.12)",
                            border: "1px solid rgba(201,168,76,0.24)",
                            backdropFilter: "blur(12px)",
                            color: "var(--color-primary)",
                          }}
                        >
                          <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                            <path d="M8 0L9.6 6.4L16 8L9.6 9.6L8 16L6.4 9.6L0 8L6.4 6.4Z" />
                          </svg>
                        </span>
                        <span
                          className="text-[10px] uppercase tracking-[0.24em]"
                          style={{ color: "rgba(255,248,242,0.72)" }}
                        >
                          {category?._count.products ?? 0}{" "}
                          {home.categoriesCount(category?._count.products ?? 0)}
                        </span>
                      </div>

                      {/* Texte bas de card */}
                      <div>
                        <p
                          className="text-[10px] uppercase tracking-[0.28em]"
                          style={{ color: "var(--color-primary)" }}
                        >
                          {translatedCategory}
                        </p>
                        <h3
                          className="mt-3 text-balance transition-colors duration-300 group-hover:text-amber-200"
                          style={{
                            fontFamily: "var(--font-cormorant), serif",
                            fontStyle: "italic",
                            color: "#fffdf8",
                            fontSize: "2.1rem",
                            lineHeight: 0.96,
                          }}
                        >
                          {translatedCategory}
                        </h3>
                        {subtitle ? (
                          <p
                            className="mt-2 text-sm"
                            style={{
                              fontFamily: "var(--font-cormorant), serif",
                              fontStyle: "italic",
                              color: "rgba(232,201,122,0.72)",
                              letterSpacing: "0.02em",
                            }}
                          >
                            {subtitle}
                          </p>
                        ) : null}
                        <p
                          className="mt-4 max-w-[28ch] text-sm"
                          style={{ color: "rgba(255,248,242,0.78)", lineHeight: 1.85 }}
                        >
                          {narrative}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </StaggerReveal>
          </div>
        </section>

        <section className="py-14 md:py-22">
          <div className="container-xl">
            <ScrollReveal>
              <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                <div className="max-w-[680px]">
                  <p className="luxe-kicker">{home.featuredEyebrow}</p>
                  <h2
                    className="mt-5 max-w-[10ch] text-balance"
                    style={{
                      fontSize: "clamp(2.7rem, 5vw, 4.8rem)",
                      lineHeight: 0.94,
                    }}
                  >
                    {home.featuredTitle}
                  </h2>
                </div>
                <Link href={productListingHref} className="btn-ghost">
                  {home.viewAll}
                </Link>
              </div>
            </ScrollReveal>

            <div className="product-grid">
              {featured.slice(0, 4).map((product, index) => {
                const primaryImage = product.images[0];
                const productText = translateProductContent(locale, product);
                const defaultVariant =
                  product.variants.find((variant) => variant.isDefault) ?? product.variants[0];

                return (
                  <ScrollReveal key={product.id} delay={index * 80}>
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
          </div>
        </section>

        <section className="py-14 md:py-24">
          <div className="container-xl">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
              <ScrollReveal>
                <div
                  className="relative h-full overflow-hidden rounded-[34px]"
                  style={{
                    border: "1px solid rgba(212,175,55,0.16)",
                    boxShadow: "0 28px 68px rgba(0,0,0,0.36)",
                    background:
                      "linear-gradient(180deg, rgba(17,17,9,0.96) 0%, rgba(10,10,8,0.94) 100%)",
                  }}
                >
                  <div className="absolute inset-0">
                    <div
                      className="absolute inset-0"
                      style={{
                        backgroundImage: `url(${ATELIER_BACKGROUND_IMAGE})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center center",
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(90deg, rgba(10,10,8,0.9) 0%, rgba(10,10,8,0.78) 36%, rgba(10,10,8,0.62) 68%, rgba(10,10,8,0.82) 100%)",
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(10,10,8,0.14) 0%, rgba(10,10,8,0.24) 36%, rgba(10,10,8,0.86) 100%)",
                      }}
                    />
                  </div>

                  <div className="relative z-10 p-7 md:p-10 lg:p-12">
                    <p className="luxe-kicker" style={{ color: "#d4af37" }}>
                      {copy.atelierLabel}
                    </p>
                    <h2
                      className="mt-5 max-w-[11ch] text-balance"
                      style={{
                        fontSize: "clamp(2.6rem, 5vw, 4.4rem)",
                        lineHeight: 0.95,
                        color: "#FFFFFF",
                      }}
                    >
                      {copy.atelierTitle}
                    </h2>
                    <p
                      className="mt-6 max-w-[620px] text-base md:text-lg"
                      style={{
                        color: "rgba(255,255,255,0.88)",
                        lineHeight: 1.9,
                      }}
                    >
                      {copy.atelierBody}
                    </p>

                    <StaggerReveal className="mt-8 grid gap-4 md:grid-cols-3">
                      {home.reasons.map(
                        (reason: { title: string; desc: string }, index: number) => (
                          <div
                            key={reason.title}
                            className="rounded-[24px] p-5"
                            style={{
                              background:
                                index === 1
                                  ? "rgba(70,56,46,0.48)"
                                  : "rgba(10,10,8,0.48)",
                              border: "1px solid rgba(212,175,55,0.14)",
                              backdropFilter: "blur(14px)",
                            }}
                          >
                            <p
                              className="text-[10px] uppercase tracking-[0.28em]"
                              style={{ color: "rgba(212,175,55,0.9)" }}
                            >
                              0{index + 1}
                            </p>
                            <h3
                              className="mt-4 text-2xl text-balance"
                              style={{
                                lineHeight: 1.02,
                                color: "#FFFFFF",
                              }}
                            >
                              {reason.title}
                            </h3>
                            <p
                              className="mt-4 text-sm"
                              style={{
                                color: "rgba(255,255,255,0.78)",
                                lineHeight: 1.8,
                              }}
                            >
                              {reason.desc}
                            </p>
                          </div>
                        )
                      )}
                    </StaggerReveal>
                  </div>
                </div>
              </ScrollReveal>

              <ParallaxSection offset={26}>
                <ScrollReveal delay={140}>
                  <div
                    className="h-full rounded-[34px] p-7 md:p-10"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(17,17,9,0.96) 0%, rgba(10,10,8,0.94) 100%)",
                      border: "1px solid rgba(201,168,76,0.14)",
                      boxShadow: "0 28px 66px rgba(0,0,0,0.36)",
                    }}
                  >
                    <p className="luxe-kicker">{copy.conciergeLabel}</p>
                    <h2
                      className="mt-5 max-w-[11ch] text-balance"
                      style={{
                        fontSize: "clamp(2.3rem, 4vw, 3.9rem)",
                        lineHeight: 0.98,
                      }}
                    >
                      {copy.conciergeTitle}
                    </h2>
                    <p className="mt-6 text-sm luxe-copy">{copy.conciergeBody}</p>

                    <div className="mt-8 space-y-3">
                      {[
                        { label: "Wave", hint: "Mobile money" },
                        { label: "Orange Money", hint: home.paymentSubtitle },
                        { label: home.cashOnDelivery, hint: siteConfig.address },
                      ].map((item, index) => (
                        <div
                          key={item.label}
                          className="flex items-center justify-between gap-4 rounded-[22px] px-4 py-4"
                          style={{
                            background:
                              index === 1
                                ? "rgba(220,193,188,0.26)"
                                : "rgba(255,255,255,0.46)",
                            border: "1px solid rgba(184,138,84,0.1)",
                          }}
                        >
                          <span style={{ color: "var(--color-text)" }}>{item.label}</span>
                          <span
                            className="text-[10px] uppercase tracking-[0.24em]"
                            style={{ color: "var(--color-primary-dark)" }}
                          >
                            {item.hint}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-8 flex flex-wrap gap-4">
                      <Link href={productListingHref} className="btn-primary">
                        {home.primaryCta}
                      </Link>
                      <Link href={giftHref} className="btn-secondary">
                        {home.secondaryCta}
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              </ParallaxSection>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter />
    </>
  );
}
