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
          background:
            "radial-gradient(circle at top left, rgba(243,111,69,0.3), transparent 32%), linear-gradient(135deg, #120816, #25112c)",
          alignItems: "center",
          justifyContent: "center",
          color: "#f6c668",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 132,
            height: 132,
            borderRadius: 40,
            border: "10px solid rgba(246,198,104,0.28)",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 56,
            fontWeight: 800,
            background: "rgba(255,255,255,0.06)",
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
