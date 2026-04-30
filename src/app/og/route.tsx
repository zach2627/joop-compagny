import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      title: "Bijoux, parfums et encens",
      subtitle:
        "Une maison luxe pensee pour offrir, collectionner et parfumer les moments du quotidien.",
      lineA: "Livraison Senegal",
      lineB: "Wave et Orange Money",
    },
    en: {
      title: "Jewelry, perfumes and incense",
      subtitle:
        "A luxury house designed for gifting, collecting and scenting everyday rituals.",
      lineA: "Delivery in Senegal",
      lineB: "Wave and Orange Money",
    },
  }[locale];

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0A0A08",
          color: "#FFFFFF",
          padding: "64px",
          alignItems: "stretch",
          justifyContent: "space-between",
          fontFamily: "Jost, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "72%",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "18px",
              color: "#C9A84C",
              fontSize: 28,
              letterSpacing: "0.24em",
              textTransform: "uppercase",
            }}
          >
            <div
              style={{
                width: 16,
                height: 16,
                borderRadius: 9999,
                background: "#C9A84C",
              }}
            />
            {siteConfig.name}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div
              style={{
                fontSize: 82,
                fontWeight: 700,
                lineHeight: 1.02,
                fontFamily: "Cormorant Garamond, serif",
              }}
            >
              {copy.title}
            </div>
            <div style={{ fontSize: 30, color: "rgba(255,255,255,0.6)", lineHeight: 1.3 }}>
              {copy.subtitle}
            </div>
          </div>

          <div style={{ display: "flex", gap: "18px", fontSize: 24, color: "#C9A84C" }}>
            <div>{copy.lineA}</div>
            <div>{copy.lineB}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "22%",
            borderRadius: 40,
            border: "2px solid rgba(201,168,76,0.24)",
            background: "#111109",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 30px 60px rgba(0,0,0,0.25)",
          }}
        >
          <div
            style={{
              display: "flex",
              width: 190,
              height: 190,
              borderRadius: 9999,
              background: "#C9A84C",
              color: "#0A0A08",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 700,
              fontFamily: "Cormorant Garamond, serif",
            }}
          >
            JO
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
