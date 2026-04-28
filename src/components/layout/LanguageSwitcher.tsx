"use client";

import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  switchLocalePath,
  type Locale,
} from "@/lib/i18n/config";

interface LanguageSwitcherProps {
  locale: Locale;
}

export function LanguageSwitcher({ locale }: LanguageSwitcherProps) {
  const handleSwitch = (targetLocale: Locale) => {
    if (targetLocale === locale) return;
    // Write cookie first — it must be present in the browser jar before the
    // navigation request reaches the middleware (which reads it to set the locale).
    const secure = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = `${LOCALE_COOKIE}=${targetLocale}; Path=/; Max-Age=${LOCALE_COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
    // Hard navigation so the full server render picks up the new cookie.
    // window.location.pathname is the real browser URL (not the middleware-rewritten path).
    const href = switchLocalePath(window.location.pathname, targetLocale);
    window.location.href = href;
  };

  return (
    <div
      className="flex items-center rounded-full p-0.5"
      style={{ border: "1px solid rgba(201,168,76,0.2)", background: "rgba(10,10,8,0.88)", backdropFilter: "blur(8px)" }}
      aria-label={locale === "fr" ? "Choisir la langue" : "Choose language"}
    >
      {(["fr", "en"] as const).map((item) => {
        const active = item === locale;
        return (
          <button
            key={item}
            onClick={() => handleSwitch(item)}
            className="px-3 py-1.5 text-[11px] font-bold rounded-full transition-all cursor-pointer"
            style={{
              background: active ? "#C9A84C" : "transparent",
              color: active ? "#0A0A08" : "rgba(255,255,255,0.6)",
            }}
            aria-current={active ? "true" : undefined}
          >
            {item.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
