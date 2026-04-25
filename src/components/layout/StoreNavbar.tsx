import Link from "next/link";
import Image from "next/image";
import { NavActions } from "./NavActions";
import { NavSearch } from "./NavSearch";
import { MobileNav } from "./MobileNav";
import { siteConfig } from "@/config/site";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";

export function StoreNavbar() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const categoryLabels = dict.categories as Record<string, string>;
  const navLinks = siteConfig.navCategories.map((slug) => ({
    href: localizedPath(`/store/products?category=${slug}`, locale),
    label: categoryLabels[slug],
  }));

  return (
    <nav
      className="fixed top-[var(--banner-height)] left-0 right-0 z-50 h-[var(--nav-height)] border-b"
      style={{
        background: "rgba(18, 8, 22, 0.84)",
        backdropFilter: "blur(18px)",
        borderColor: "rgba(246, 198, 104, 0.18)",
      }}
      aria-label={dict.nav.aria}
    >
      <div className="container-xl h-full flex items-center justify-between gap-4">
        <Link
          href={localizedPath("/", locale)}
          className="flex items-center gap-3 shrink-0"
          aria-label={dict.nav.home}
        >
          <Image src="/icon.svg" alt={siteConfig.name} width={40} height={40} />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-[0.22em]" style={{ color: "#f6c668" }}>
              JOOP
            </span>
            <span className="text-[10px] uppercase tracking-[0.3em]" style={{ color: "#f0d3e4" }}>
              Compagny
            </span>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="px-3 py-1.5 text-sm rounded-full transition-all duration-200"
              style={{ color: "#f7eef5" }}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <NavSearch label={dict.nav.search} />
          <NavActions
            locale={locale}
            labels={{
              account: dict.nav.account,
              admin: dict.nav.admin,
              login: dict.nav.login,
            }}
          />
          <MobileNav
            navLinks={navLinks}
            labels={{
              menuOpen: dict.nav.menuOpen,
              menuClose: dict.nav.menuClose,
            }}
          />
        </div>
      </div>
    </nav>
  );
}
