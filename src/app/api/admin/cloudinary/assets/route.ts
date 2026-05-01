import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "@/lib/auth/jwt";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type CloudinaryResource = {
  public_id?: string;
  secure_url?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  created_at?: string;
};

function withTimeout<T>(promise: Promise<T>, timeoutMs: number) {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Cloudinary timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    }),
  ]);
}

export async function GET(request: Request) {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorise" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix")?.trim() || "products/";
  const maxResults = Math.min(
    Math.max(Number(searchParams.get("limit") ?? "60"), 1),
    100
  );

  try {
    const result = await withTimeout(
      cloudinary.api.resources({
        type: "upload",
        prefix,
        max_results: maxResults,
        resource_type: "image",
      }),
      8000
    );

    const assets = ((result.resources as CloudinaryResource[] | undefined) ?? [])
      .filter((resource) => resource.public_id && resource.secure_url)
      .map((resource) => ({
        publicId: resource.public_id!,
        secureUrl: resource.secure_url!,
        width: resource.width ?? null,
        height: resource.height ?? null,
        format: resource.format ?? null,
        bytes: resource.bytes ?? null,
        createdAt: resource.created_at ?? null,
      }))
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

    return NextResponse.json({ assets });
  } catch (error) {
    console.error("cloudinary assets listing failed:", { prefix, maxResults, error });
    return NextResponse.json(
      { error: "Impossible de recuperer les assets Cloudinary." },
      { status: 502 }
    );
  }
}
