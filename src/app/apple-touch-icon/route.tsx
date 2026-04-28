import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0A0A08",
          alignItems: "center",
          justifyContent: "center",
          color: "#C9A84C",
          fontFamily: "Cormorant Garamond, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 132,
            height: 132,
            borderRadius: 40,
            border: "10px solid rgba(201,168,76,0.28)",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 700,
            background: "#111109",
            color: "#C9A84C",
          }}
        >
          JO
        </div>
      </div>
    ),
    {
      width: 180,
      height: 180,
    }
  );
}
