// src/app/api/admin/upload/route.ts
import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getServerSession } from "@/lib/auth/jwt";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const DEFAULT_FOLDER = "joop-compagny/banners";
const ALLOWED_FOLDER_PATTERN = /^(?:joop-compagny\/banners|products\/[a-z0-9-]+)$/i;

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const requestedFolder = searchParams.get("folder") ?? DEFAULT_FOLDER;
  const folder = ALLOWED_FOLDER_PATTERN.test(requestedFolder)
    ? requestedFolder
    : DEFAULT_FOLDER;

  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Type de fichier non autorisé. Formats acceptés : JPEG, PNG, WebP." },
      { status: 415 }
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Fichier trop volumineux. Taille maximale : 5 Mo." },
      { status: 413 }
    );
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  try {
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder }, (err, res) => {
          if (err || !res) return reject(err);
          resolve(res);
        })
        .end(buffer);
    });

    return NextResponse.json({ url: result.secure_url, publicId: result.public_id });
  } catch {
    return NextResponse.json({ error: "Échec de l'upload" }, { status: 502 });
  }
}
