// src/components/admin/ProductImageUpload.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle } from "lucide-react";

interface Props {
  productId: string;
}

export function ProductImageUpload({ productId }: Props) {
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setSuccess(false);
    setError("");

    try {
      // 1. Upload vers Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET ?? "joop_compagny"
      );
      formData.append("folder", `products/${productId}`);

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!cloudRes.ok) throw new Error("Échec upload Cloudinary");
      const cloudData = await cloudRes.json();

      // 2. Sauvegarder l'URL en base
      const dbRes = await fetch("/api/products/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          url: cloudData.secure_url,
          alt: cloudData.original_filename,
          publicId: cloudData.public_id,
        }),
      });

      if (!dbRes.ok) throw new Error("Échec sauvegarde en base");

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(String(err));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full transition-all border"
        style={{
          color: uploading ? "#86868b" : "#C9A84C",
          borderColor: uploading ? "#d2d2d7" : "rgba(201,168,76,0.4)",
        }}
      >
        {uploading ? (
          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Upload...</>
        ) : success ? (
          <><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Ajoutée !</>
        ) : (
          <><Upload className="w-3.5 h-3.5" /> Image</>
        )}
      </button>
      {error && <p className="text-xs text-red-500 mt-1 max-w-[150px]">{error}</p>}
    </div>
  );
}
