// src/app/api/img/route.ts
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOST = "store.storeimages.cdn-apple.com";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");

  if (!url) return new NextResponse("Missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return new NextResponse("Invalid url", { status: 400 });
  }

  if (parsed.hostname !== ALLOWED_HOST) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const res = await fetch(url, {
    headers: {
      Referer: "https://www.apple.com/",
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    },
    next: { revalidate: 86400 },
  });

  if (!res.ok) return new NextResponse("Upstream error", { status: res.status });

  const buffer = await res.arrayBuffer();
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=3600",
    },
  });
}
