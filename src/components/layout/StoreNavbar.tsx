import { siteConfig } from "@/config/site";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import { StoreNavbarClient } from "./StoreNavbarClient";

export function StoreNavbar() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const categoryLabels = dict.categories as Record<string, string>;
  const navLinks = siteConfig.navCategories.map((slug) => ({
    href: localizedPath(`/store/products?category=${slug}`, locale),
    label: categoryLabels[slug],
  }));

  return (
    <StoreNavbarClient
      locale={locale}
      ariaLabel={dict.nav.aria}
      navLinks={navLinks}
      labels={{
        home: dict.nav.home,
        search: dict.nav.search,
        account: dict.nav.account,
        admin: dict.nav.admin,
        login: dict.nav.login,
        menuOpen: dict.nav.menuOpen,
        menuClose: dict.nav.menuClose,
      }}
    />
  );
}
