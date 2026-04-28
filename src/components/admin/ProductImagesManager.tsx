// src/components/admin/ProductImagesManager.tsx
"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload, Loader2, Trash2, Star, Tag } from "lucide-react";
import Image from "next/image";
import { productThumbnailImage } from "@/lib/images/cloudinary";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  color: string | null;
  isPrimary: boolean;
}

interface Props {
  productId: string;
  images: ProductImage[];
  variantColors?: string[];
}

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

export function ProductImagesManager({ productId, images, variantColors = [] }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [isPending, startTransition] = useTransition();
  /** Couleur à associer au prochain upload */
  const [pendingColor, setPendingColor] = useState("");
  /** id de l'image dont on édite la couleur inline */
  const [editingColorId, setEditingColorId] = useState<string | null>(null);
  const [editingColorVal, setEditingColorVal] = useState("");

  const refresh = () => startTransition(() => { router.refresh(); });

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleFile = async (file: File) => {
    setUploadError("");

    if (!ALLOWED_TYPES.includes(file.type)) {
      setUploadError("Format non accepté (JPEG, PNG, WebP uniquement).");
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
      const uploadRes = await fetch(
        `/api/admin/upload?folder=products/${productId}`,
        { method: "POST", body: form }
      );
      if (!uploadRes.ok) {
        const { error } = await uploadRes.json();
        throw new Error(error ?? "Échec upload");
      }
      const { url } = await uploadRes.json();

      const dbRes = await fetch("/api/products/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          url,
          alt: file.name.replace(/\.[^.]+$/, ""),
          color: pendingColor.trim() || null,
        }),
      });
      if (!dbRes.ok) {
        const { error } = await dbRes.json();
        throw new Error(error ?? "Échec sauvegarde image");
      }

      setPendingColor("");
      refresh();
    } catch (err) {
      setUploadError(String(err));
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  // ── Supprimer ─────────────────────────────────────────────────────────────
  const handleDelete = async (imageId: string) => {
    if (!confirm("Supprimer cette image ?")) return;
    await fetch("/api/products/images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId }),
    });
    refresh();
  };

  // ── Définir principale ────────────────────────────────────────────────────
  const handleSetPrimary = async (imageId: string) => {
    await fetch("/api/products/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId, productId }),
    });
    refresh();
  };

  // ── Éditer la couleur d'une image existante ───────────────────────────────
  const handleSaveColor = async (imageId: string) => {
    await fetch("/api/products/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId, productId, color: editingColorVal.trim() || null }),
    });
    setEditingColorId(null);
    refresh();
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Galerie */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((img) => (
            <div key={img.id} className="flex flex-col gap-1 items-center">
              <div className="relative group w-16 h-16 rounded-lg overflow-hidden bg-apple-gray-50 border border-apple-gray-200 flex-shrink-0">
                <Image
                  src={productThumbnailImage(img.url)}
                  alt={img.alt ?? "image produit"}
                  fill
                  sizes="64px"
                  className="object-contain p-1"
                />
                {/* Badge principale */}
                {img.isPrimary && (
                  <span className="absolute top-0.5 left-0.5 bg-yellow-400 rounded-full p-0.5">
                    <Star className="w-2.5 h-2.5 text-yellow-900 fill-yellow-900" />
                  </span>
                )}
                {/* Badge couleur */}
                {img.color && !editingColorId && (
                  <span className="absolute bottom-0 inset-x-0 text-[8px] text-center truncate px-0.5 py-0.5 bg-black/60 text-white">
                    {img.color}
                  </span>
                )}
                {/* Actions hover */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                  {!img.isPrimary && (
                    <button
                      onClick={() => handleSetPrimary(img.id)}
                      disabled={isPending}
                      title="Définir comme principale"
                      className="p-1 rounded bg-yellow-400/90 hover:bg-yellow-400 transition-colors"
                    >
                      <Star className="w-3 h-3 text-yellow-900" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setEditingColorId(img.id);
                      setEditingColorVal(img.color ?? "");
                    }}
                    title="Associer une couleur"
                    className="p-1 rounded bg-blue-500/90 hover:bg-blue-500 transition-colors"
                  >
                    <Tag className="w-3 h-3 text-white" />
                  </button>
                  <button
                    onClick={() => handleDelete(img.id)}
                    disabled={isPending}
                    title="Supprimer"
                    className="p-1 rounded bg-red-500/90 hover:bg-red-500 transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-white" />
                  </button>
                </div>
              </div>

              {/* Édition couleur inline */}
              {editingColorId === img.id && (
                <div className="flex gap-1 items-center">
                  {variantColors.length > 0 ? (
                    <select
                      autoFocus
                      value={editingColorVal}
                      onChange={(e) => setEditingColorVal(e.target.value)}
                      className="text-[10px] px-1.5 py-0.5 border border-apple-gray-300 rounded w-28 focus:outline-none bg-white"
                      onKeyDown={(e) => { if (e.key === "Escape") setEditingColorId(null); }}
                    >
                      <option value="">— Aucune —</option>
                      {variantColors.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      autoFocus
                      value={editingColorVal}
                      onChange={(e) => setEditingColorVal(e.target.value)}
                      placeholder="ex: Or sable"
                      className="text-[10px] px-1.5 py-0.5 border border-apple-gray-300 rounded w-24 focus:outline-none"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleSaveColor(img.id);
                        if (e.key === "Escape") setEditingColorId(null);
                      }}
                    />
                  )}
                  <button
                    onClick={() => handleSaveColor(img.id)}
                    className="text-[10px] px-1.5 py-0.5 bg-apple-blue text-white rounded"
                  >
                    OK
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload + couleur optionnelle */}
      <div className="flex items-center gap-2 flex-wrap">
        {variantColors.length > 0 ? (
          <select
            value={pendingColor}
            onChange={(e) => setPendingColor(e.target.value)}
            className="text-xs px-2 py-1.5 border border-apple-gray-200 rounded-full focus:outline-none focus:border-apple-blue w-40 bg-white"
            title="Associer une couleur à la prochaine image uploadée"
          >
            <option value="">— Couleur (optionnel) —</option>
            {variantColors.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        ) : (
          <input
            value={pendingColor}
            onChange={(e) => setPendingColor(e.target.value)}
            placeholder="Couleur (optionnel)"
            className="text-xs px-2 py-1.5 border border-apple-gray-200 rounded-full focus:outline-none focus:border-apple-blue w-36"
            title="Associer une couleur à la prochaine image uploadée"
          />
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />
        <button
          onClick={() => inputRef.current?.click()}
          disabled={uploading || isPending}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all"
          style={{
            color: uploading ? "rgba(255,255,255,0.6)" : "#C9A84C",
            borderColor: uploading ? "rgba(255,255,255,0.16)" : "rgba(201,168,76,0.4)",
          }}
        >
          {uploading
            ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Upload...</>
            : <><Upload className="w-3.5 h-3.5" /> Ajouter</>
          }
        </button>
      </div>

      {uploadError && (
        <p className="text-xs text-red-500 max-w-[220px]">{uploadError}</p>
      )}
    </div>
  );
}
