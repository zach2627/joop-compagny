import { getDictionary, getRequestLocale } from "@/lib/i18n/server";

export function StoreBanner() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const ticker = dict.banner.items.join("  /  ") + "  /  ";

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center h-[var(--banner-height)]"
      style={{
        background:
          "linear-gradient(90deg, rgba(7,6,5,0.98) 0%, rgba(10,9,7,0.98) 100%)",
        borderBottom: "1px solid rgba(214,179,93,0.16)",
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
          animation: joop-marquee 28s linear infinite;
        }
        .joop-marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="joop-marquee-track" aria-hidden="true">
        <span
          style={{
            color: "#d6b35d",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            paddingRight: "4rem",
          }}
        >
          {ticker}
        </span>
        <span
          style={{
            color: "#d6b35d",
            fontSize: "10px",
            fontWeight: 600,
            letterSpacing: "0.28em",
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
