import { getDictionary, getRequestLocale } from "@/lib/i18n/server";

export function StoreBanner() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const ticker = dict.banner.items.join("  /  ") + "  /  ";

  return (
    <div
      className="fixed left-0 right-0 top-0 z-50 flex h-[var(--banner-height)] items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(90deg, rgba(10,10,8,0.96) 0%, rgba(18,18,13,0.98) 100%)",
        borderBottom: "1px solid rgba(201,168,76,0.12)",
        backdropFilter: "blur(14px)",
      }}
      aria-label={dict.banner.aria}
    >
      <style>{`
        @keyframes joop-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .joop-marquee-track {
          display: flex;
          white-space: nowrap;
          will-change: transform;
          animation: joop-marquee 30s linear infinite;
        }
        .joop-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="joop-marquee-track" aria-hidden="true">
        <span
          style={{
            color: "var(--color-primary-dark)",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            paddingRight: "4rem",
          }}
        >
          {ticker}
        </span>
        <span
          style={{
            color: "rgba(255,255,255,0.56)",
            fontSize: "10px",
            fontWeight: 500,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            paddingRight: "4rem",
          }}
        >
          {ticker}
        </span>
      </div>

      <span className="sr-only">{dict.banner.items.join(". ")}</span>
    </div>
  );
}
