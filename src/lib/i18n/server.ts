import { headers } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_HEADER, type Locale } from "./config";
import { dictionaries } from "./translations";

export function getRequestLocale(): Locale {
  const headerLocale = headers().get(LOCALE_HEADER);
  return isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;
}

export function getDictionary(locale: Locale = getRequestLocale()) {
  return dictionaries[locale];
}
