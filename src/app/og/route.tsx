import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const runtime = "edge";

export async function GET(request: Request) {
  const locale = new URL(request.url).searchParams.get("locale") === "en" ? "en" : "fr";
  const copy = {
    fr: {
      title: "Bijoux, parfums et encens",
      subtitle:
        "Une maison luxe et coloree pensee pour offrir, collectionner et parfumer les moments du quotidien.",
      lineA: "Livraison Senegal",
      lineB: "Wave et Orange Money",
    },
    en: {
      title: "Jewelry, perfumes and incense",
      subtitle:
        "A bold luxury house designed for gifting, collecting and scenting everyday rituals.",
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
          background:
            "radial-gradient(circle at top left, #f36f45 0%, transparent 26%), radial-gradient(circle at top right, #6b2f9c 0%, transparent 24%), linear-gradient(135deg, #100715 0%, #1c0f24 38%, #150b1d 100%)",
          color: "#FFFFFF",
          padding: "64px",
          alignItems: "stretch",
          justifyContent: "space-between",
          fontFamily: "sans-serif",
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
              color: "#f6c668",
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
                background: "#f6c668",
              }}
            />
            {siteConfig.name}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div style={{ fontSize: 82, fontWeight: 800, lineHeight: 1.02 }}>
              {copy.title}
            </div>
            <div style={{ fontSize: 30, color: "#f5d7e7", lineHeight: 1.3 }}>
              {copy.subtitle}
            </div>
          </div>

          <div style={{ display: "flex", gap: "18px", fontSize: 24, color: "#f6c668" }}>
            <div>{copy.lineA}</div>
            <div>{copy.lineB}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            width: "22%",
            borderRadius: 40,
            border: "2px solid rgba(246,198,104,0.35)",
            background: "rgba(255,255,255,0.05)",
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
              background: "linear-gradient(135deg, #f6c668, #ff8b5d)",
              color: "#190d20",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 64,
              fontWeight: 800,
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
