// src/components/admin/ImageStation.tsx
"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Upload,
  Trash2,
  Star,
  Loader2,
  CheckCircle,
  XCircle,
  X,
  Search,
  Camera,
} from "lucide-react";
import { productThumbnailImage } from "@/lib/images/cloudinary";

type ProductImage = {
  id: string;
  url: string;
  alt: string | null;
  color: string | null;
  isPrimary: boolean;
  sortOrder: number;
};

export type ProductForStation = {
  id: string;
  name: string;
  slug: string;
  images: ProductImage[];
  variantColors: string[];
};

type QueueItem = {
  key: string;
  file: File;
  preview: string;
  color: string;
  status: "idle" | "uploading" | "done" | "error";
  error?: string;
};

const ALLOWED = ["image/jpeg", "image/png", "image/webp"];
const MAX_MB = 5;

export function ImageStation({ products }: { products: ProductForStation[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [globalError, setGlobalError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // `products` prop updates automatically on router.refresh()
  const selected = products.find((p) => p.id === selectedId) ?? null;

  const refresh = () => startTransition(() => { router.refresh(); });

  const filtered = search.trim()
    ? products.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.slug.toLowerCase().includes(search.toLowerCase())
      )
    : products;

  // ── Add files to upload queue ─────────────────────────────────────────────
  const addFiles = useCallback(
    (files: FileList | File[]) => {
      setGlobalError("");
      const defaultColor = selected?.variantColors[0] ?? "";
      const items: QueueItem[] = [];
      const errors: string[] = [];

      for (const file of Array.from(files)) {
        if (!ALLOWED.includes(file.type)) {
          errors.push(`"${file.name}" : format non accepté (JPEG, PNG, WebP).`);
          continue;
        }
        if (file.size > MAX_MB * 1024 * 1024) {
          errors.push(`"${file.name}" : fichier trop volumineux (max ${MAX_MB} Mo).`);
          continue;
        }
        items.push({
          key: `${file.name}-${Date.now()}-${Math.random()}`,
          file,
          preview: URL.createObjectURL(file),
          color: defaultColor,
          status: "idle",
        });
      }

      if (errors.length) setGlobalError(errors[0]);
      if (items.length) setQueue((prev) => [...prev, ...items]);
    },
    [selected]
  );

  // ── Drag & drop ───────────────────────────────────────────────────────────
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (selected) addFiles(e.dataTransfer.files);
  };

  // ── Upload one queued file ────────────────────────────────────────────────
  const uploadItem = useCallback(async (item: QueueItem, productId: string) => {
    setQueue((prev) =>
      prev.map((q) => (q.key === item.key ? { ...q, status: "uploading" } : q))
    );
    try {
      const form = new FormData();
      form.append("file", item.file);
      const uploadRes = await fetch(`/api/admin/upload?folder=products/${productId}`, {
        method: "POST",
        body: form,
      });
      if (!uploadRes.ok) {
        const { error } = await uploadRes.json();
        throw new Error(error ?? "Échec upload Cloudinary");
      }
      const { url } = await uploadRes.json();

      const dbRes = await fetch("/api/products/images", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          url,
          alt: item.file.name.replace(/\.[^.]+$/, ""),
          color: item.color.trim() || null,
        }),
      });
      if (!dbRes.ok) {
        const { error } = await dbRes.json();
        throw new Error(error ?? "Échec sauvegarde");
      }

      URL.revokeObjectURL(item.preview);
      setQueue((prev) =>
        prev.map((q) => (q.key === item.key ? { ...q, status: "done" } : q))
      );
    } catch (err) {
      setQueue((prev) =>
        prev.map((q) =>
          q.key === item.key ? { ...q, status: "error", error: String(err) } : q
        )
      );
    }
  }, []);

  // ── Upload all pending / errored items ────────────────────────────────────
  const uploadAll = async () => {
    if (!selected) return;
    const pending = queue.filter((q) => q.status === "idle" || q.status === "error");
    await Promise.all(pending.map((item) => uploadItem(item, selected.id)));
    refresh();
  };

  // ── Queue helpers ─────────────────────────────────────────────────────────
  const removeFromQueue = (key: string) =>
    setQueue((prev) => {
      const item = prev.find((q) => q.key === key);
      if (item) URL.revokeObjectURL(item.preview);
      return prev.filter((q) => q.key !== key);
    });

  const clearDone = () =>
    setQueue((prev) => prev.filter((q) => q.status !== "done"));

  const setQueueColor = (key: string, color: string) =>
    setQueue((prev) =>
      prev.map((q) => (q.key === key ? { ...q, color } : q))
    );

  // ── Image actions ─────────────────────────────────────────────────────────
  const deleteImage = async (imageId: string) => {
    if (!confirm("Supprimer cette image de Cloudinary et de la base ?")) return;
    await fetch("/api/products/images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId }),
    });
    refresh();
  };

  const setPrimary = async (imageId: string, productId: string) => {
    await fetch("/api/products/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageId, productId }),
    });
    refresh();
  };

  const pendingCount = queue.filter(
    (q) => q.status === "idle" || q.status === "error"
  ).length;
  const isUploading = queue.some((q) => q.status === "uploading");

  return (
    <div className="flex gap-6" style={{ height: "calc(100vh - 180px)", minHeight: 500 }}>
      {/* ── Left: product list ──────────────────────────────────────────────── */}
      <div className="w-64 shrink-0 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-apple-gray-400 pointer-events-none" />
          <input
            type="search"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-2 text-sm border border-apple-gray-200 rounded-apple-lg focus:outline-none focus:border-apple-blue bg-white"
          />
        </div>

        <div className="card flex-1 overflow-y-auto divide-y divide-apple-gray-100 p-0">
          {filtered.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedId(p.id);
                setQueue([]);
                setGlobalError("");
              }}
              className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${
                selectedId === p.id
                  ? "bg-blue-50 text-apple-blue border-r-2 border-apple-blue"
                  : "hover:bg-apple-gray-50 text-apple-gray-800"
              }`}
            >
              <div className="w-9 h-9 rounded-apple-sm overflow-hidden bg-apple-gray-100 shrink-0 flex items-center justify-center">
                {p.images[0] ? (
                  <Image
                    src={productThumbnailImage(p.images[0].url)}
                    alt={p.name}
                    width={36}
                    height={36}
                    className="object-contain w-full h-full"
                  />
                ) : (
                  <Camera className="w-4 h-4 text-apple-gray-300" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate leading-tight">{p.name}</p>
                <p className="text-[10px] text-apple-gray-400 tabular-nums">
                  {p.images.length} image{p.images.length !== 1 ? "s" : ""}
                </p>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="p-4 text-sm text-apple-gray-400 text-center">Aucun produit.</p>
          )}
        </div>
      </div>

      {/* ── Right: image management ─────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col gap-4 overflow-y-auto pb-4">
        {!selected ? (
          <div className="card flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-16 h-16 rounded-full bg-apple-gray-100 flex items-center justify-center mb-4">
              <Camera className="w-7 h-7 text-apple-gray-300" />
            </div>
            <p className="font-medium text-apple-gray-700">Sélectionnez un produit</p>
            <p className="text-sm text-apple-gray-400 mt-1">
              Choisissez un produit dans la liste pour gérer ses photos.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div>
              <h2 className="text-lg font-semibold text-apple-gray-900">{selected.name}</h2>
              <p className="text-sm text-apple-gray-400">
                {selected.images.length} image{selected.images.length !== 1 ? "s" : ""} en base ·{" "}
                <span className="font-mono">{selected.slug}</span>
              </p>
            </div>

            {/* Current images grid */}
            <div className="card p-5 space-y-4">
              <h3 className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
                Images actuelles
              </h3>

              {selected.images.length === 0 ? (
                <p className="text-sm text-apple-gray-400">Aucune image pour ce produit.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {selected.images.map((img) => (
                    <div key={img.id} className="relative group flex flex-col gap-1.5">
                      <div className="w-32 h-32 rounded-apple-md overflow-hidden bg-apple-gray-50 border border-apple-gray-200 relative">
                        <Image
                          src={productThumbnailImage(img.url)}
                          alt={img.alt ?? "image produit"}
                          fill
                          sizes="128px"
                          className="object-contain p-2"
                        />
                        {img.isPrimary && (
                          <span className="absolute top-1.5 left-1.5 bg-yellow-400 rounded-full p-0.5 shadow">
                            <Star className="w-3 h-3 text-yellow-900 fill-yellow-900" />
                          </span>
                        )}
                        {img.color && (
                          <span className="absolute bottom-0 inset-x-0 text-[9px] text-center truncate px-1 py-0.5 bg-black/60 text-white">
                            {img.color}
                          </span>
                        )}
                        {/* Hover actions */}
                        <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          {!img.isPrimary && (
                            <button
                              onClick={() => setPrimary(img.id, selected.id)}
                              disabled={isPending}
                              title="Définir comme image principale"
                              className="p-1.5 rounded-full bg-yellow-400/90 hover:bg-yellow-400 transition-colors"
                            >
                              <Star className="w-3.5 h-3.5 text-yellow-900" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteImage(img.id)}
                            disabled={isPending}
                            title="Supprimer"
                            className="p-1.5 rounded-full bg-red-500/90 hover:bg-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-white" />
                          </button>
                        </div>
                      </div>
                      {img.isPrimary && (
                        <p className="text-[10px] text-yellow-600 font-medium text-center">
                          Principale
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upload zone */}
            <div
              className={`card p-5 space-y-4 border-2 transition-colors ${
                dragOver
                  ? "border-apple-blue bg-blue-50"
                  : "border-dashed border-apple-gray-200 hover:border-apple-gray-300"
              }`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={(e) => {
                // Only clear if leaving the zone entirely
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOver(false);
                }
              }}
              onDrop={handleDrop}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-xs font-semibold text-apple-gray-500 uppercase tracking-wider">
                  Nouvelles photos
                </h3>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files) {
                      addFiles(e.target.files);
                      e.target.value = "";
                    }
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border border-apple-gray-200 text-apple-gray-600 hover:border-apple-blue hover:text-apple-blue transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Choisir des fichiers
                </button>
              </div>

              {/* Drop hint — only shown when queue is empty */}
              {queue.length === 0 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex flex-col items-center justify-center py-10 rounded-apple-md cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-apple-gray-300 mb-3" />
                  <p className="text-sm text-apple-gray-500">
                    Glissez vos photos ici ou{" "}
                    <span className="text-apple-blue underline">cliquez pour parcourir</span>
                  </p>
                  <p className="text-xs text-apple-gray-400 mt-1">
                    JPEG · PNG · WebP · 5 Mo max par fichier · sélection multiple
                  </p>
                </button>
              )}

              {/* Queue list */}
              {queue.length > 0 && (
                <div className="space-y-2">
                  {queue.map((item) => (
                    <div
                      key={item.key}
                      className="flex items-center gap-3 p-3 bg-apple-gray-50 rounded-apple-md"
                    >
                      {/* Preview */}
                      <div className="w-12 h-12 rounded-apple-sm overflow-hidden bg-apple-gray-200 shrink-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.preview}
                          alt={item.file.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* File name + size + error */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-apple-gray-800 truncate">
                          {item.file.name}
                        </p>
                        <p className="text-xs text-apple-gray-400">
                          {(item.file.size / 1024 / 1024).toFixed(1)} Mo
                        </p>
                        {item.error && (
                          <p className="text-xs text-red-500 mt-0.5 truncate">{item.error}</p>
                        )}
                      </div>

                      {/* Color picker — only for editable states */}
                      {(item.status === "idle" || item.status === "error") &&
                        (selected.variantColors.length > 0 ? (
                          <select
                            value={item.color}
                            onChange={(e) => setQueueColor(item.key, e.target.value)}
                            className="text-xs px-2 py-1.5 border border-apple-gray-200 rounded-full focus:outline-none focus:border-apple-blue w-36 bg-white shrink-0"
                          >
                            <option value="">— Couleur —</option>
                            {selected.variantColors.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        ) : (
                          <input
                            value={item.color}
                            onChange={(e) => setQueueColor(item.key, e.target.value)}
                            placeholder="Couleur (optionnel)"
                            className="text-xs px-2 py-1.5 border border-apple-gray-200 rounded-full focus:outline-none focus:border-apple-blue w-32 shrink-0"
                          />
                        ))}

                      {/* Status icon */}
                      <div className="shrink-0 flex items-center gap-1">
                        {item.status === "uploading" && (
                          <Loader2 className="w-5 h-5 text-apple-blue animate-spin" />
                        )}
                        {item.status === "done" && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                        {item.status === "error" && (
                          <XCircle className="w-5 h-5 text-red-500" />
                        )}
                        {item.status !== "uploading" && (
                          <button
                            onClick={() => removeFromQueue(item.key)}
                            title="Retirer"
                            className="p-0.5 text-apple-gray-400 hover:text-apple-gray-700 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {globalError && (
                <p className="text-xs text-red-500">{globalError}</p>
              )}

              {/* Footer actions */}
              {queue.length > 0 && (
                <div className="flex items-center justify-between pt-1 border-t border-apple-gray-100">
                  <button
                    onClick={clearDone}
                    className="text-xs text-apple-gray-400 hover:text-apple-gray-600 transition-colors"
                  >
                    Effacer les terminés
                  </button>
                  {pendingCount > 0 && (
                    <button
                      onClick={uploadAll}
                      disabled={isUploading}
                      className="btn-primary flex items-center gap-2 text-sm px-5 py-2"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Upload en cours…
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Uploader {pendingCount} photo{pendingCount > 1 ? "s" : ""}
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
