// src/components/admin/ProductImagesManager.tsx
"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Loader2, Star, Tag, Trash2, Upload } from "lucide-react";
import { fetchWithAdminRefresh } from "@/lib/auth/admin-client";
import { productThumbnailImage } from "@/lib/images/cloudinary";
import { CloudinaryMediaLibrary } from "./CloudinaryMediaLibrary";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  color: string | null;
  isPrimary: boolean;
}

interface Props {
  productId: string;
  productSlug?: string;
  images: ProductImage[];
  variantColors?: string[];
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

async function readApiError(response: Response, fallback: string) {
  const payload = await response.json().catch(() => null);
  return payload?.error ?? fallback;
}

export function ProductImagesManager({
  productId,
  productSlug,
  images,
  variantColors = [],
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [pendingColor, setPendingColor] = useState("");
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [editingColorVal, setEditingColorVal] = useState("");
  const uploadFolder = `products/${(productSlug?.trim() || productId).trim()}`;

  const refresh = () => startTransition(() => router.refresh());

  const handleFile = async (file: File) => {
    setUploadError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Format non accepte (JPEG, PNG, WebP uniquement).");
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setUploadError(`Fichier trop volumineux (max ${MAX_SIZE_MB} Mo).`);
      return;
    }

    setUploading(true);

    try {
      const form = new FormData();
      form.append("file", file);

      const uploadResponse = await fetchWithAdminRefresh(
        `/api/admin/upload?folder=${encodeURIComponent(uploadFolder)}`,
        {
          method: "POST",
          body: form,
        }
      );

      if (!uploadResponse.ok) {
        throw new Error(await readApiError(uploadResponse, "Echec upload"));
      }

      const { url } = await uploadResponse.json();

      const saveResponse = await fetchWithAdminRefresh("/api/products/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          url,
          alt: file.name.replace(/\.[^.]+$/, ""),
          color: pendingColor.trim() || null,
        }),
      });

      if (!saveResponse.ok) {
        throw new Error(await readApiError(saveResponse, "Echec sauvegarde image"));
      }

      setPendingColor("");
      refresh();
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Operation impossible pour le moment."
      );
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Supprimer cette image ?")) {
      return;
    }

    setUploadError("");

    const response = await fetchWithAdminRefresh("/api/products/images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId }),
    });

    if (!response.ok) {
      setUploadError(await readApiError(response, "Suppression impossible."));
      return;
    }

    refresh();
  };

  const handleSetPrimary = async (imageId: string) => {
    setUploadError("");

    const response = await fetchWithAdminRefresh("/api/products/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId, productId }),
    });

    if (!response.ok) {
      setUploadError(await readApiError(response, "Mise a jour impossible."));
      return;
    }

    refresh();
  };

  const handleSaveColor = async (imageId: string) => {
    setUploadError("");

    const response = await fetchWithAdminRefresh("/api/products/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageId,
        productId,
        color: editingColorVal.trim() || null,
      }),
    });

    if (!response.ok) {
      setUploadError(await readApiError(response, "Mise a jour impossible."));
      return;
    }

    setEditingColorId(null);
    refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {images.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div key={img.id} className="flex flex-col items-center gap-1">
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-apple-gray-200 bg-apple-gray-50 group">
                <Image
                  src={productThumbnailImage(img.url)}
                  alt={img.alt ?? "image produit"}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />

                {img.isPrimary ? (
                  <span className="absolute left-0.5 top-0.5 rounded-full bg-yellow-400 p-0.5">
                    <Star className="h-2.5 w-2.5 fill-yellow-900 text-yellow-900" />
                  </span>
                ) : null}

                {img.color && !editingColorId ? (
                  <span className="absolute inset-x-0 bottom-0 truncate bg-black/60 px-0.5 py-0.5 text-center text-[8px] text-white">
                    {img.color}
                  </span>
                ) : null}

                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  {!img.isPrimary ? (
                    <button
                      onClick={() => handleSetPrimary(img.id)}
                      disabled={isPending}
                      title="Definir comme principale"
                      className="rounded bg-yellow-400/90 p-1 transition-colors hover:bg-yellow-400"
                    >
                      <Star className="h-3 w-3 text-yellow-900" />
                    </button>
                  ) : null}

                  <button
                    onClick={() => {
                      setEditingColorId(img.id);
                      setEditingColorVal(img.color ?? "");
                    }}
                    title="Associer une couleur"
                    className="rounded bg-blue-500/90 p-1 transition-colors hover:bg-blue-500"
                  >
                    <Tag className="h-3 w-3 text-white" />
                  </button>

                  <button
                    onClick={() => handleDelete(img.id)}
                    disabled={isPending}
                    title="Supprimer"
                    className="rounded bg-red-500/90 p-1 transition-colors hover:bg-red-500"
                  >
                    <Trash2 className="h-3 w-3 text-white" />
                  </button>
                </div>
              </div>

              {editingColorId === img.id ? (
                <div className="flex items-center gap-1">
                  {variantColors.length > 0 ? (
                    <select
                      autoFocus
                      value={editingColorVal}
                      onChange={(event) => setEditingColorVal(event.target.value)}
                      className="w-28 rounded border border-apple-gray-300 bg-white px-1.5 py-0.5 text-[10px] focus:outline-none"
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          setEditingColorId(null);
                        }
                      }}
                    >
                      <option value="">- Aucune -</option>
                      {variantColors.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      autoFocus
                      value={editingColorVal}
                      onChange={(event) => setEditingColorVal(event.target.value)}
                      placeholder="ex: Or sable"
                      className="w-24 rounded border border-apple-gray-300 px-1.5 py-0.5 text-[10px] focus:outline-none"
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          void handleSaveColor(img.id);
                        }

                        if (event.key === "Escape") {
                          setEditingColorId(null);
                        }
                      }}
                    />
                  )}

                  <button
                    onClick={() => handleSaveColor(img.id)}
                    className="rounded bg-apple-blue px-1.5 py-0.5 text-[10px] text-white"
                  >
                    OK
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        {variantColors.length > 0 ? (
          <select
            value={pendingColor}
            onChange={(event) => setPendingColor(event.target.value)}
            className="w-40 rounded-full border border-apple-gray-200 bg-white px-2 py-1.5 text-xs focus:border-apple-blue focus:outline-none"
            title="Associer une couleur a la prochaine image uploadée"
          >
            <option value="">- Couleur (optionnel) -</option>
            {variantColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        ) : (
          <input
            value={pendingColor}
            onChange={(event) => setPendingColor(event.target.value)}
            placeholder="Couleur (optionnel)"
            className="w-36 rounded-full border border-apple-gray-200 px-2 py-1.5 text-xs focus:border-apple-blue focus:outline-none"
            title="Associer une couleur a la prochaine image uploadée"
          />
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFile(file);
            }
          }}
        />

        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading || isPending}
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
          ) : (
            <>
              <Upload className="h-3.5 w-3.5" />
              Ajouter
            </>
          )}
        </button>

        <CloudinaryMediaLibrary
          productId={productId}
          productFolder={productSlug}
          pendingColor={pendingColor}
          onImagesAdded={refresh}
        />
      </div>

      {uploadError ? (
        <p className="max-w-[220px] text-xs text-red-500">{uploadError}</p>
      ) : null}
    </div>
  );
}
