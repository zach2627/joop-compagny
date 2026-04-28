import Link from "next/link";
import { siteConfig } from "@/config/site";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";

export function StoreFooter() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const categoryLabels = dict.categories as Record<string, string>;
  const productLinks = siteConfig.navCategories.map((slug) => ({
    href: localizedPath(`/store/products?category=${slug}`, locale),
    label: categoryLabels[slug],
  }));

  return (
    <footer
      style={{
        background:
          "radial-gradient(circle at top left, rgba(201,168,76,0.08), transparent 18%), linear-gradient(180deg, #080706 0%, #0d0b09 100%)",
        borderTop: "1px solid rgba(201,168,76,0.15)",
      }}
    >
      <div className="container-xl py-14">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-start">
            <div className="mb-5">
              <p
                className="text-[1.1rem] uppercase"
                style={{
                  color: "#C9A84C",
                  letterSpacing: "0.36em",
                  fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                }}
              >
                JOOP
              </p>
              <p
                className="mt-2 text-[0.98rem] uppercase"
                style={{
                  color: "#C9A84C",
                  letterSpacing: "0.22em",
                  fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
                }}
              >
                COMPAGNY
              </p>
            </div>
            <p
              className="max-w-sm text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.6)" }}
            >
              {dict.footer.description}
            </p>
          </div>

          <div>
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#C9A84C" }}
            >
              {dict.footer.products}
            </h3>
            <div className="space-y-2">
              {productLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block text-sm transition-colors hover:underline"
                  style={{ color: "rgba(255,255,255,0.7)" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#C9A84C" }}
            >
              {dict.footer.contact}
            </h3>
            <div className="space-y-3 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
              <p>{dict.footer.location}</p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="block transition-colors hover:underline"
              >
                {siteConfig.email}
              </a>
              <a
                href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`}
                className="block transition-colors hover:underline"
              >
                {siteConfig.phone}
              </a>
              <p>{dict.footer.delivery}</p>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-between gap-4 pt-6 md:flex-row"
          style={{ borderTop: "1px solid rgba(201,168,76,0.12)" }}
        >
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {new Date().getFullYear()} {siteConfig.name}. {dict.footer.rights}
          </p>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            {siteConfig.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
