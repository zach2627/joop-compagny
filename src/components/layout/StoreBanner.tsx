import { getDictionary, getRequestLocale } from "@/lib/i18n/server";

export function StoreBanner() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const ticker = dict.banner.items.join("  ·  ") + "  ·  ";

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center h-[var(--banner-height)]"
      style={{
        background:
          "linear-gradient(90deg, rgba(243,111,69,0.95) 0%, rgba(106,47,156,0.95) 45%, rgba(18,8,22,0.98) 100%)",
        borderBottom: "1px solid rgba(246,198,104,0.16)",
        overflow: "hidden",
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
          animation: joop-marquee 20s linear infinite;
        }
        .joop-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="joop-marquee-track" aria-hidden="true">
        <span
          style={{
            color: "#fff6fb",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            paddingRight: "3rem",
          }}
        >
          {ticker}
        </span>
        <span
          style={{
            color: "#fff6fb",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            paddingRight: "3rem",
          }}
        >
          {ticker}
        </span>
      </div>

      <span className="sr-only">{dict.banner.items.join(". ")}</span>
    </div>
  );
}
