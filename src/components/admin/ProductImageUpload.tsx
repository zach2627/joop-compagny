"use client";

import { useRef, useState } from "react";
import { CheckCircle, Loader2, Upload } from "lucide-react";

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

      if (!cloudRes.ok) throw new Error("Echec upload Cloudinary");
      const cloudData = await cloudRes.json();

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

      if (!dbRes.ok) throw new Error("Echec sauvegarde en base");

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
        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all"
        style={{
          color: uploading ? "rgba(255,255,255,0.6)" : "#C9A84C",
          borderColor: uploading ? "rgba(255,255,255,0.16)" : "rgba(201,168,76,0.4)",
        }}
      >
        {uploading ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Upload...
          </>
        ) : success ? (
          <>
            <CheckCircle className="h-3.5 w-3.5 text-apple-blue" />
            Ajoutee !
          </>
        ) : (
          <>
            <Upload className="h-3.5 w-3.5" />
            Image
          </>
        )}
      </button>
      {error ? (
        <p className="mt-1 max-w-[150px] text-xs text-red-500">{error}</p>
      ) : null}
    </div>
  );
}
