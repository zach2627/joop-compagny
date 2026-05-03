import Link from "next/link";
import {
  hasPublicPhone,
  hasWhatsApp,
  publicPhoneHref,
  siteConfig,
  whatsAppUrl,
} from "@/config/site";
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
  const supportMailto = `mailto:${siteConfig.email}?subject=${encodeURIComponent(
    locale === "en"
      ? "Advice before ordering"
      : "Conseil avant commande"
  )}`;

  return (
    <footer
      style={{
        background:
          "linear-gradient(180deg, rgba(10,10,8,0.96) 0%, rgba(18,18,13,0.98) 100%)",
        borderTop: "1px solid rgba(201,168,76,0.14)",
      }}
    >
      <div className="container-xl py-16 md:py-20">
        <div
          className="luxe-panel mb-10 grid gap-10 p-8 md:grid-cols-[minmax(0,1.1fr)_repeat(2,minmax(0,0.8fr))] md:p-10"
        >
          <div className="max-w-[420px]">
            <p
              className="text-[1.18rem] uppercase"
              style={{
                color: "var(--color-primary-dark)",
                letterSpacing: "0.36em",
                fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
              }}
            >
              JOOP
            </p>
            <p
              className="mt-1 text-[0.84rem] uppercase"
              style={{
                color: "rgba(255,255,255,0.5)",
                letterSpacing: "0.28em",
              }}
            >
              Compagny
            </p>
            <p className="mt-6 text-sm leading-8" style={{ color: "var(--color-text-secondary)" }}>
              {dict.footer.description}
            </p>
          </div>

          <div>
            <h3 className="luxe-kicker">{dict.footer.products}</h3>
            <div className="mt-5 space-y-3">
              {productLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block text-sm transition-colors duration-300"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="luxe-kicker">{dict.footer.contact}</h3>
            <div className="mt-5 space-y-3 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              <p>{dict.footer.location}</p>
              <a href={`mailto:${siteConfig.email}`} className="block transition-colors duration-300">
                {siteConfig.email}
              </a>
              {hasPublicPhone && publicPhoneHref ? (
                <a href={publicPhoneHref} className="block transition-colors duration-300">
                  {siteConfig.phone}
                </a>
              ) : (
                <p>
                  {locale === "en"
                    ? "Advice available by email before ordering."
                    : "Conseil disponible par email avant commande."}
                </p>
              )}
              <p>{dict.footer.delivery}</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {hasWhatsApp && whatsAppUrl ? (
                <a href={whatsAppUrl} className="btn-primary">
                  WhatsApp
                </a>
              ) : null}
              <a href={supportMailto} className="btn-secondary">
                {locale === "en" ? "Email support" : "Nous ecrire"}
              </a>
            </div>
          </div>
        </div>

        <div
          className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          <p className="text-xs">
            {new Date().getFullYear()} {siteConfig.name}. {dict.footer.rights}
          </p>
          <p className="text-xs uppercase tracking-[0.24em]">{siteConfig.tagline}</p>
        </div>
      </div>
    </footer>
  );
}
