import Link from "next/link";
import Image from "next/image";
import { getFeaturedProducts, getCategories } from "@/features/products/service";
import { formatXOF } from "@/features/payment/paydunya";
import { siteConfig } from "@/config/site";
import { StoreFooter } from "@/components/layout/StoreFooter";
import { StoreBanner } from "@/components/layout/StoreBanner";
import { StoreNavbar } from "@/components/layout/StoreNavbar";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import { translateCategory } from "@/lib/i18n/translations";
import {
  translateProductContent,
  translateProductImageAlt,
} from "@/lib/i18n/product-content";
import { productCardImage } from "@/lib/images/cloudinary";

export const revalidate = 60;

const spotlightGradients = [
  "linear-gradient(135deg, rgba(243,111,69,0.28), rgba(246,198,104,0.16))",
  "linear-gradient(135deg, rgba(106,47,156,0.3), rgba(243,111,69,0.12))",
  "linear-gradient(135deg, rgba(246,198,104,0.2), rgba(106,47,156,0.18))",
];

export default async function HomePage() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const [featured, categories] = await Promise.all([
    getFeaturedProducts(),
    getCategories(),
  ]);

  const home = dict.home;
  const productListingHref = localizedPath("/store/products", locale);
  const heroProducts = featured.slice(0, 3);

  return (
    <>
      <StoreBanner />
      <StoreNavbar />
      <main className="pt-[100px]">
        <div style={{ minHeight: "100vh" }}>
          <section className="relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle at 12% 18%, rgba(243,111,69,0.28), transparent 24%), radial-gradient(circle at 88% 12%, rgba(106,47,156,0.28), transparent 22%), radial-gradient(circle at 62% 72%, rgba(246,198,104,0.16), transparent 24%)",
              }}
            />

            <div className="container-xl relative z-10 py-16 md:py-24">
              <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-10 items-center">
                <ScrollReveal>
                  <div className="max-w-2xl">
                    <div
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6"
                      style={{
                        background: "rgba(255,255,255,0.08)",
                        border: "1px solid rgba(246,198,104,0.18)",
                        color: "#f6c668",
                      }}
                    >
                      <span
                        className="inline-block w-2 h-2 rounded-full"
                        style={{ background: "#ff8b5d" }}
                      />
                      <span className="text-xs uppercase tracking-[0.22em] font-semibold">
                        {home.badge}
                      </span>
                    </div>

                    <h1
                      className="mb-5 text-balance"
                      style={{
                        fontSize: "clamp(3.2rem, 8vw, 6.4rem)",
                        lineHeight: 0.95,
                        color: "#fff7fb",
                      }}
                    >
                      {home.heroTitle}
                    </h1>
                    <p
                      className="mb-6 max-w-xl"
                      style={{
                        fontSize: "clamp(1.1rem, 2vw, 1.55rem)",
                        lineHeight: 1.2,
                        color: "#f6c668",
                      }}
                    >
                      {home.heroAccent}
                    </p>
                    <p
                      className="max-w-xl mb-8 text-balance"
                      style={{ color: "#f0d3e4", fontSize: "1rem", lineHeight: 1.8 }}
                    >
                      {home.heroBody}
                    </p>

                    <div className="flex flex-wrap gap-3 mb-8">
                      <Link href={productListingHref} className="btn-primary">
                        {home.primaryCta}
                      </Link>
                      <Link
                        href={localizedPath("/store/products?category=coffrets", locale)}
                        className="btn-secondary"
                      >
                        {home.secondaryCta}
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-3 mb-10">
                      {home.highlights.map((item: string) => (
                        <span
                          key={item}
                          className="px-4 py-2 rounded-full text-sm"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            color: "#fff6fb",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { value: "04", label: home.stats.authentic },
                        { value: "24h", label: home.stats.delivery },
                        { value: "Gift", label: home.stats.warranty },
                        { value: "100%", label: home.stats.hiddenFees },
                      ].map(({ value, label }) => (
                        <div
                          key={label}
                          className="rounded-[20px] p-4"
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(246,198,104,0.12)",
                          }}
                        >
                          <div
                            className="font-semibold mb-1"
                            style={{ color: "#f6c668", fontSize: "1.1rem" }}
                          >
                            {value}
                          </div>
                          <p className="text-xs uppercase tracking-[0.18em]" style={{ color: "#d8bfd2" }}>
                            {label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={120}>
                  <div
                    className="relative rounded-[34px] p-5 md:p-7"
                    style={{
                      background:
                        "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
                      border: "1px solid rgba(246,198,104,0.14)",
                    }}
                  >
                    <div className="grid gap-4">
                      {heroProducts.map((product, index) => {
                        const primaryImage = product.images[0];
                        const productText = translateProductContent(locale, product);
                        const price = Number(product.variants[0]?.price ?? product.basePrice);

                        return (
                          <div
                            key={product.id}
                            className="grid grid-cols-[100px,1fr] gap-4 rounded-[26px] p-4 items-center"
                            style={{
                              background: spotlightGradients[index % spotlightGradients.length],
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <div
                              className="relative aspect-square rounded-[20px] overflow-hidden"
                              style={{ background: "rgba(17,9,21,0.42)" }}
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
                                  className="object-contain p-4"
                                  sizes="120px"
                                  priority={index === 0}
                                />
                              ) : null}
                            </div>
                            <div>
                              <p
                                className="text-xs uppercase tracking-[0.22em] mb-2"
                                style={{ color: "#f6c668" }}
                              >
                                {translateCategory(locale, product.category)}
                              </p>
                              <h2 className="text-2xl mb-2" style={{ color: "#fff7fb" }}>
                                {productText.name}
                              </h2>
                              <p className="text-sm mb-3" style={{ color: "#f0d3e4" }}>
                                {productText.shortDescription}
                              </p>
                              <div className="flex items-center justify-between gap-4">
                                <span className="font-semibold" style={{ color: "#fff7fb" }}>
                                  {formatXOF(price)}
                                </span>
                                <Link
                                  href={localizedPath(`/store/products/${product.slug}`, locale)}
                                  className="text-sm font-medium"
                                  style={{ color: "#fff7fb" }}
                                >
                                  {home.see}
                                </Link>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          <section className="py-8 md:py-12">
            <ScrollReveal>
              <div className="container-xl">
                <div
                  className="rounded-[30px] p-8 md:p-10 grid lg:grid-cols-[0.8fr,1.2fr] gap-8 items-start"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(106,47,156,0.16), rgba(243,111,69,0.12) 52%, rgba(255,255,255,0.04))",
                    border: "1px solid rgba(246,198,104,0.12)",
                  }}
                >
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] mb-3" style={{ color: "#f6c668" }}>
                      {home.storyEyebrow}
                    </p>
                    <h2 className="text-4xl md:text-5xl mb-4" style={{ color: "#fff7fb", lineHeight: 1 }}>
                      {home.storyTitle}
                    </h2>
                  </div>
                  <div>
                    <p className="text-base leading-8 mb-6" style={{ color: "#f0d3e4" }}>
                      {home.storyBody}
                    </p>
                    <div className="grid md:grid-cols-3 gap-3">
                      {home.highlights.map((item: string, index: number) => (
                        <div
                          key={item}
                          className="rounded-[22px] p-4"
                          style={{
                            background:
                              index === 0
                                ? "rgba(243,111,69,0.14)"
                                : index === 1
                                ? "rgba(106,47,156,0.16)"
                                : "rgba(246,198,104,0.12)",
                            border: "1px solid rgba(255,255,255,0.06)",
                            color: "#fff6fb",
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </section>

          <section className="py-14 md:py-20">
            <div className="container-xl">
              <ScrollReveal>
                <div className="flex items-end justify-between gap-6 mb-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] mb-3" style={{ color: "#f6c668" }}>
                      {home.featuredEyebrow}
                    </p>
                    <h2 className="text-4xl md:text-5xl" style={{ color: "#fff7fb", lineHeight: 1 }}>
                      {home.featuredTitle}
                    </h2>
                  </div>
                  <Link href={productListingHref} className="text-sm" style={{ color: "#f6c668" }}>
                    {home.viewAll}
                  </Link>
                </div>
              </ScrollReveal>

              <div className="product-grid">
                {featured.slice(0, 8).map((product, index) => {
                  const primaryImage = product.images[0];
                  const defaultVariant = product.variants[0];
                  const price = Number(defaultVariant?.price ?? product.basePrice);
                  const productText = translateProductContent(locale, product);

                  return (
                    <ScrollReveal key={product.id} delay={index * 60}>
                      <Link
                        href={localizedPath(`/store/products/${product.slug}`, locale)}
                        className="group block h-full"
                      >
                        <div className="prod-card-inner">
                          <div
                            className="relative aspect-square overflow-hidden"
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
                                className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 50vw, 25vw"
                              />
                            ) : null}
                            <div className="prod-accent" />
                          </div>

                          <div className="p-5">
                            <p
                              className="text-xs uppercase tracking-[0.18em] mb-2"
                              style={{ color: "#f6c668" }}
                            >
                              {translateCategory(locale, product.category)}
                            </p>
                            <h3 className="prod-name text-xl mb-2">{productText.name}</h3>
                            <p className="text-sm mb-4 leading-7" style={{ color: "#e3c5d7" }}>
                              {productText.shortDescription}
                            </p>
                            <div className="flex items-center justify-between gap-4">
                              <span className="font-semibold" style={{ color: "#fff7fb" }}>
                                {formatXOF(price)}
                              </span>
                              <span className="text-sm" style={{ color: "#f6c668" }}>
                                {home.buy}
                              </span>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="py-14 md:py-20">
            <div className="container-xl">
              <ScrollReveal>
                <div className="flex items-end justify-between gap-6 mb-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] mb-3" style={{ color: "#f6c668" }}>
                      {home.catalogEyebrow}
                    </p>
                    <h2 className="text-4xl md:text-5xl" style={{ color: "#fff7fb", lineHeight: 1 }}>
                      {home.catalogTitle}
                    </h2>
                  </div>
                </div>
              </ScrollReveal>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {categories.map((category, index) => (
                  <ScrollReveal key={category.id} delay={index * 70}>
                    <Link
                      href={localizedPath(`/store/products?category=${category.slug}`, locale)}
                      className="rounded-[28px] p-6 min-h-[220px] flex flex-col justify-between transition-transform duration-300 hover:-translate-y-1"
                      style={{
                        background:
                          index % 4 === 0
                            ? "linear-gradient(135deg, rgba(243,111,69,0.24), rgba(255,255,255,0.05))"
                            : index % 4 === 1
                            ? "linear-gradient(135deg, rgba(106,47,156,0.28), rgba(255,255,255,0.04))"
                            : index % 4 === 2
                            ? "linear-gradient(135deg, rgba(246,198,104,0.18), rgba(255,255,255,0.04))"
                            : "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(243,111,69,0.14))",
                        border: "1px solid rgba(246,198,104,0.12)",
                      }}
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold"
                        style={{
                          background: "rgba(17,9,21,0.24)",
                          color: "#fff7fb",
                        }}
                      >
                        0{index + 1}
                      </div>
                      <div>
                        <h3 className="text-3xl mb-2" style={{ color: "#fff7fb" }}>
                          {translateCategory(locale, category)}
                        </h3>
                        <p className="text-sm" style={{ color: "#f0d3e4" }}>
                          {category._count.products} {home.categoriesCount(category._count.products)}
                        </p>
                      </div>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            </div>
          </section>

          <section className="py-14 md:py-20">
            <div className="container-xl">
              <div className="grid lg:grid-cols-[1.1fr,0.9fr] gap-6">
                <ScrollReveal>
                  <div
                    className="rounded-[32px] p-8 md:p-10 h-full"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(246,198,104,0.16), rgba(255,255,255,0.05))",
                      border: "1px solid rgba(246,198,104,0.14)",
                    }}
                  >
                    <p className="text-xs uppercase tracking-[0.24em] mb-3" style={{ color: "#f6c668" }}>
                      {home.commitmentEyebrow}
                    </p>
                    <h2 className="text-4xl md:text-5xl mb-8" style={{ color: "#fff7fb", lineHeight: 1 }}>
                      {home.commitmentTitle}
                    </h2>
                    <div className="space-y-4">
                      {home.reasons.map(
                        (reason: { title: string; desc: string }, index: number) => (
                          <div
                            key={reason.title}
                            className="rounded-[24px] p-5"
                            style={{
                              background: "rgba(17,9,21,0.28)",
                              border: "1px solid rgba(255,255,255,0.06)",
                            }}
                          >
                            <p className="text-xs uppercase tracking-[0.18em] mb-2" style={{ color: "#f6c668" }}>
                              0{index + 1}
                            </p>
                            <h3 className="text-2xl mb-2" style={{ color: "#fff7fb" }}>
                              {reason.title}
                            </h3>
                            <p className="text-sm leading-7" style={{ color: "#f0d3e4" }}>
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
                    className="rounded-[32px] p-8 md:p-10 h-full flex flex-col justify-between"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(106,47,156,0.24), rgba(243,111,69,0.14))",
                      border: "1px solid rgba(246,198,104,0.14)",
                    }}
                  >
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] mb-3" style={{ color: "#f6c668" }}>
                        {home.paymentEyebrow}
                      </p>
                      <h2 className="text-4xl md:text-5xl mb-4" style={{ color: "#fff7fb", lineHeight: 1 }}>
                        {home.paymentTitle}
                      </h2>
                      <p className="text-base leading-8 mb-8" style={{ color: "#f0d3e4" }}>
                        {home.paymentSubtitle}
                      </p>
                    </div>

                    <div className="space-y-3 mb-8">
                      {[
                        { label: "Wave", hint: "Mobile money" },
                        { label: "Orange Money", hint: "Paiement local" },
                        { label: home.cashOnDelivery, hint: "Selon zone" },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[22px] px-5 py-4 flex items-center justify-between"
                          style={{
                            background: "rgba(17,9,21,0.26)",
                            border: "1px solid rgba(255,255,255,0.06)",
                          }}
                        >
                          <span style={{ color: "#fff7fb" }}>{item.label}</span>
                          <span className="text-xs uppercase tracking-[0.18em]" style={{ color: "#f6c668" }}>
                            {item.hint}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link href={productListingHref} className="btn-primary w-full justify-center">
                      {home.primaryCta}
                    </Link>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </section>

          <StoreFooter />
        </div>
      </main>
    </>
  );
}
