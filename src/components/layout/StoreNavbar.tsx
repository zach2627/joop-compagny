import Link from "next/link";
import { MobileNav } from "./MobileNav";
import { NavActions } from "./NavActions";
import { NavSearch } from "./NavSearch";
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
        background: "rgba(10, 10, 8, 0.92)",
        backdropFilter: "blur(20px)",
        borderColor: "rgba(201, 168, 76, 0.18)",
      }}
      aria-label={dict.nav.aria}
    >
      <div className="container-xl flex h-full items-center justify-between gap-4">
        <Link
          href={localizedPath("/", locale)}
          className="flex shrink-0 flex-col justify-center leading-none"
          aria-label={dict.nav.home}
        >
          <span
            className="text-[1.02rem] uppercase"
            style={{
              color: "#C9A84C",
              letterSpacing: "0.38em",
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            JOOP
          </span>
          <span
            className="mt-1 text-[0.92rem] uppercase"
            style={{
              color: "#C9A84C",
              letterSpacing: "0.24em",
              fontFamily: 'Georgia, "Times New Roman", serif',
            }}
          >
            COMPAGNY
          </span>
        </Link>

        <div className="hidden items-center gap-2 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.24em] transition-all duration-200"
              style={{ color: "rgba(255,255,255,0.6)" }}
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
