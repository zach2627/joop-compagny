import Link from "next/link";
import Image from "next/image";
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
          "radial-gradient(circle at top left, rgba(243,111,69,0.16), transparent 22%), linear-gradient(180deg, #120816 0%, #1b0f22 100%)",
        borderTop: "1px solid rgba(246,198,104,0.15)",
      }}
    >
      <div className="container-xl py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div className="flex flex-col items-start">
            <Image src="/icon.svg" alt={siteConfig.name} width={74} height={74} className="mb-4" />
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: "#f0d3e4" }}>
              {dict.footer.description}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#f6c668" }}>
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
            <h3 className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#f6c668" }}>
              {dict.footer.contact}
            </h3>
            <div className="space-y-3 text-sm" style={{ color: "#f7eef5" }}>
              <p>{dict.footer.location}</p>
              <a href={`mailto:${siteConfig.email}`} className="block transition-colors hover:underline">
                {siteConfig.email}
              </a>
              <a href={`tel:${siteConfig.phone.replace(/\s+/g, "")}`} className="block transition-colors hover:underline">
                {siteConfig.phone}
              </a>
              <p>{dict.footer.delivery}</p>
            </div>
          </div>
        </div>

        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(246,198,104,0.12)" }}
        >
          <p className="text-xs" style={{ color: "#a67a9b" }}>
            © {new Date().getFullYear()} {siteConfig.name}. {dict.footer.rights}
          </p>
          <p className="text-xs" style={{ color: "#a67a9b" }}>
            {siteConfig.tagline}
          </p>
        </div>
      </div>
    </footer>
  );
}
