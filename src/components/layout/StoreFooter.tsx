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
          "radial-gradient(circle at top left, rgba(214,179,93,0.1), transparent 18%), linear-gradient(180deg, #080706 0%, #0d0b09 100%)",
        borderTop: "1px solid rgba(214,179,93,0.15)",
      }}
    >
      <div className="container-xl py-14">
        <div className="mb-10 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="flex flex-col items-start">
            <div className="mb-5">
              <p
                className="text-[1.1rem] uppercase"
                style={{
                  color: "#d6b35d",
                  letterSpacing: "0.36em",
                  fontFamily: 'Georgia, "Times New Roman", serif',
                }}
              >
                JOOP
              </p>
              <p
                className="mt-2 text-[0.98rem] uppercase"
                style={{
                  color: "#d6b35d",
                  letterSpacing: "0.22em",
                  fontFamily: 'Georgia, "Times New Roman", serif',
                }}
              >
                COMPAGNY
              </p>
            </div>
            <p
              className="max-w-sm text-sm leading-relaxed"
              style={{ color: "#f0d3e4" }}
            >
              {dict.footer.description}
            </p>
          </div>

          <div>
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#f6c668" }}
            >
              {dict.footer.products}
            </h3>
            <div className="space-y-2">
              {productLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block text-sm transition-colors hover:underline"
                  style={{ color: "#f7eef5" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3
              className="mb-4 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#f6c668" }}
            >
              {dict.footer.contact}
            </h3>
            <div className="space-y-3 text-sm" style={{ color: "#f7eef5" }}>
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
          style={{ borderTop: "1px solid rgba(214,179,93,0.12)" }}
        >
          <p className="text-xs" style={{ color: "#a67a9b" }}>
            {new Date().getFullYear()} {siteConfig.name}. {dict.footer.rights}
          </p>
          <p className="text-xs" style={{ color: "#a67a9b" }}>
            {siteConfig.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
