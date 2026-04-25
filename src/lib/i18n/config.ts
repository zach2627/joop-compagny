export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";
export const LOCALE_HEADER = "x-joop-locale";
export const LOCALE_COOKIE = "joop_locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: string | null | undefined): value is Locale {
  return LOCALES.includes(value as Locale);
}

export function getPathLocale(pathname: string): Locale | null {
  const segment = pathname.split("/").filter(Boolean)[0];
  return isLocale(segment) ? segment : null;
}

export function stripLocalePrefix(pathname: string): string {
  const parts = pathname.split("/");
  const maybeLocale = parts[1];

  if (!isLocale(maybeLocale)) {
    return pathname || "/";
  }

  const stripped = "/" + parts.slice(2).join("/");
  return stripped === "/" ? "/" : stripped.replace(/\/$/, "");
}

export function localizedPath(path: string, locale: Locale): string {
  if (/^https?:\/\//.test(path) || path.startsWith("mailto:") || path.startsWith("tel:")) {
    return path;
  }

  const [pathnameAndQuery, hash = ""] = path.split("#");
  const [pathname = "/", query = ""] = pathnameAndQuery.split("?");
  const cleanPathname = stripLocalePrefix(pathname.startsWith("/") ? pathname : `/${pathname}`);
  const localizedPathname =
    locale === DEFAULT_LOCALE
      ? cleanPathname
      : cleanPathname === "/"
      ? `/${locale}`
      : `/${locale}${cleanPathname}`;

  return `${localizedPathname}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
}

export function switchLocalePath(pathname: string, locale: Locale): string {
  return localizedPath(stripLocalePrefix(pathname), locale);
}
