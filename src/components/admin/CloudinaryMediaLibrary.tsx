"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Image as ImageIcon, Loader2, RefreshCcw, Search, X } from "lucide-react";
import { fetchWithAdminRefresh } from "@/lib/auth/admin-client";
import { productThumbnailImage } from "@/lib/images/cloudinary";

type CloudinaryAsset = {
  publicId: string;
  secureUrl: string;
  width: number | null;
  height: number | null;
  format: string | null;
  bytes: number | null;
  createdAt: string | null;
};

interface Props {
  productId: string;
  productFolder?: string;
  pendingColor?: string;
  onImagesAdded?: () => void;
}

function fileLabel(publicId: string) {
  return publicId.split("/").pop()?.replace(/[-_]+/g, " ") ?? publicId;
}

function humanFileSize(bytes: number | null) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} Mo`;
  return `${Math.max(1, Math.round(bytes / 1024))} Ko`;
}

function normalizeFolderSegment(value?: string | null) {
  return value?.trim().replace(/^\/+|\/+$/g, "") ?? "";
}

function dedupeAssets(groups: CloudinaryAsset[][]) {
  const map = new Map<string, CloudinaryAsset>();

  groups.flat().forEach((asset) => {
    if (!map.has(asset.publicId)) {
      map.set(asset.publicId, asset);
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}

export function CloudinaryMediaLibrary({
  productId,
  productFolder,
  pendingColor,
  onImagesAdded,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [assets, setAssets] = useState<CloudinaryAsset[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const normalizedProductFolder = normalizeFolderSegment(productFolder);
  const normalizedProductId = normalizeFolderSegment(productId);
  const primaryPrefix = normalizedProductFolder
    ? `products/${normalizedProductFolder}/`
    : `products/${normalizedProductId}/`;
  const legacyPrefix =
    normalizedProductId && normalizedProductId !== normalizedProductFolder
      ? `products/${normalizedProductId}/`
      : null;

  const filteredAssets = useMemo(() => {
    const search = query.trim().toLowerCase();
    if (!search) return assets;
    return assets.filter((asset) => {
      const label = fileLabel(asset.publicId).toLowerCase();
      return label.includes(search) || asset.publicId.toLowerCase().includes(search);
    });
  }, [assets, query]);

  const loadProductAssets = useCallback(async () => {
    const fetchPrefix = async (prefix: string, limit = 80) => {
      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 8000);

      try {
        const response = await fetchWithAdminRefresh(
          `/api/admin/cloudinary/assets?prefix=${encodeURIComponent(prefix)}&limit=${limit}`,
          {
            signal: controller.signal,
            cache: "no-store",
          }
        );

        if (!response.ok) {
          const payload = await response.json().catch(() => null);

          if (response.status === 401) {
            throw new Error(
              "La session admin a expire. Recharge la page puis reconnecte-toi si necessaire."
            );
          }

          throw new Error(payload?.error ?? "Impossible de charger les images Cloudinary.");
        }

        const payload = await response.json();
        return (payload.assets ?? []) as CloudinaryAsset[];
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          throw new Error(
            "Le chargement des images prend trop de temps. Clique sur Actualiser pour reessayer."
          );
        }

        throw error;
      } finally {
        window.clearTimeout(timeoutId);
      }
    };

    const specificPrefixes = [primaryPrefix, legacyPrefix].filter(
      (prefix): prefix is string => Boolean(prefix)
    );
    const scopedAssets: CloudinaryAsset[][] = [];

    for (const prefix of specificPrefixes) {
      scopedAssets.push(await fetchPrefix(prefix));
    }

    const dedupedScopedAssets = dedupeAssets(scopedAssets);

    if (dedupedScopedAssets.length > 0) {
      return dedupedScopedAssets;
    }

    return fetchPrefix("products", 50);
  }, [legacyPrefix, primaryPrefix]);

  useEffect(() => {
    if (!open || assets.length > 0 || loading) return;

    let cancelled = false;

    const loadAssets = async () => {
      setLoading(true);
      setError("");
      try {
        const loadedAssets = await loadProductAssets();
        if (!cancelled) {
          setAssets(loadedAssets);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Chargement impossible.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadAssets();

    return () => {
      cancelled = true;
    };
  }, [assets.length, loadProductAssets, loading, open]);

  const toggleSelection = (publicId: string) => {
    setSelectedIds((current) =>
      current.includes(publicId)
        ? current.filter((id) => id !== publicId)
        : [...current, publicId]
    );
  };

  const reloadAssets = async () => {
    setAssets([]);
    setSelectedIds([]);
    setError("");
    setLoading(true);
    try {
      const loadedAssets = await loadProductAssets();
      setAssets(loadedAssets);
    } catch (reloadError) {
      setError(reloadError instanceof Error ? reloadError.message : "Chargement impossible.");
    } finally {
      setLoading(false);
    }
  };

  const handleInsert = async () => {
    const selectedAssets = assets.filter((asset) => selectedIds.includes(asset.publicId));
    if (selectedAssets.length === 0) return;

    setSaving(true);
    setError("");
    try {
      await Promise.all(
        selectedAssets.map((asset) =>
          fetchWithAdminRefresh("/api/products/images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId,
              url: asset.secureUrl,
              alt: fileLabel(asset.publicId),
              color: pendingColor?.trim() || null,
            }),
          }).then(async (response) => {
            if (!response.ok) {
              const payload = await response.json().catch(() => null);
              throw new Error(payload?.error ?? "Echec de l'ajout des images.");
            }
          })
        )
      );

      setOpen(false);
      setSelectedIds([]);
      onImagesAdded?.();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Sauvegarde impossible.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all"
        style={{
          color: "#C9A84C",
          borderColor: "rgba(201,168,76,0.4)",
          background: "rgba(201,168,76,0.04)",
        }}
      >
        <ImageIcon className="h-3.5 w-3.5" />
        Choisir depuis Cloudinary
      </button>

      {open ? (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/72 px-4 py-6">
          <div
            className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] border"
            style={{
              background: "linear-gradient(180deg, rgba(17,17,9,0.98) 0%, rgba(10,10,8,0.98) 100%)",
              borderColor: "rgba(201,168,76,0.18)",
              boxShadow: "0 28px 90px rgba(0,0,0,0.46)",
            }}
          >
            <div className="flex items-start justify-between gap-4 border-b border-white/8 px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#C9A84C]">
                  Bibliotheque Cloudinary
                </p>
                <h3 className="mt-2 text-2xl text-white">Choisir des images existantes</h3>
                <p className="mt-1 text-sm text-white/50">
                  Selectionne une ou plusieurs images deja presentes dans le dossier{" "}
                  <span className="font-mono text-white/70">{primaryPrefix.replace(/\/$/, "")}</span>.
                  {legacyPrefix ? (
                    <>
                      {" "}
                      L&apos;ancien dossier{" "}
                      <span className="font-mono text-white/55">
                        {legacyPrefix.replace(/\/$/, "")}
                      </span>{" "}
                      est aussi verifie automatiquement.
                    </>
                  ) : null}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full border border-white/10 p-2 text-white/60 transition hover:border-white/20 hover:text-white"
                aria-label="Fermer la bibliotheque"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-3 border-b border-white/8 px-6 py-4">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher une image..."
                  className="w-full rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-[#C9A84C]/40"
                />
              </div>
              <button
                type="button"
                onClick={reloadAssets}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-[#C9A84C]/35 hover:text-white disabled:opacity-50"
              >
                <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                Actualiser
              </button>
            </div>

            <div className="min-h-[320px] flex-1 overflow-y-auto px-6 py-5">
              {loading ? (
                <div className="flex h-full min-h-[320px] items-center justify-center gap-3 text-white/60">
                  <Loader2 className="h-5 w-5 animate-spin text-[#C9A84C]" />
                  Chargement des images Cloudinary...
                </div>
              ) : error ? (
                <div className="flex min-h-[320px] items-center justify-center">
                  <div className="max-w-md rounded-3xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-center text-sm text-red-200">
                    {error}
                  </div>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="flex min-h-[320px] items-center justify-center">
                  <div className="max-w-md text-center text-sm text-white/50">
                    Aucune image correspondante. Tu peux aussi utiliser le bouton{" "}
                    <span className="font-semibold text-[#C9A84C]">Ajouter</span> pour uploader un nouveau fichier.
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredAssets.map((asset) => {
                    const selected = selectedIds.includes(asset.publicId);

                    return (
                      <button
                        key={asset.publicId}
                        type="button"
                        onClick={() => toggleSelection(asset.publicId)}
                        className="group overflow-hidden rounded-[24px] border text-left transition-all"
                        style={{
                          borderColor: selected
                            ? "rgba(201,168,76,0.42)"
                            : "rgba(255,255,255,0.08)",
                          background: selected ? "rgba(201,168,76,0.07)" : "rgba(255,255,255,0.02)",
                          boxShadow: selected ? "0 18px 40px rgba(201,168,76,0.12)" : "none",
                        }}
                      >
                        <div className="relative aspect-square overflow-hidden bg-[#111109]">
                          <Image
                            src={productThumbnailImage(asset.secureUrl)}
                            alt={fileLabel(asset.publicId)}
                            fill
                            sizes="(min-width: 1280px) 18rem, (min-width: 768px) 30vw, 100vw"
                            className="object-contain p-4 transition duration-300 group-hover:scale-[1.02]"
                          />
                          {selected ? (
                            <span className="absolute right-3 top-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#C9A84C] text-[#0A0A08]">
                              <Check className="h-4 w-4" />
                            </span>
                          ) : null}
                        </div>
                        <div className="space-y-1 px-4 py-3">
                          <p className="truncate text-sm font-medium text-white">
                            {fileLabel(asset.publicId)}
                          </p>
                          <p className="truncate text-xs text-white/40">{asset.publicId}</p>
                          <div className="flex items-center gap-2 text-[11px] text-white/35">
                            {asset.width && asset.height ? <span>{asset.width}×{asset.height}</span> : null}
                            {asset.format ? <span>{asset.format.toUpperCase()}</span> : null}
                            {asset.bytes ? <span>{humanFileSize(asset.bytes)}</span> : null}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-white/8 px-6 py-4">
              <p className="text-sm text-white/45">
                {selectedIds.length} image{selectedIds.length > 1 ? "s" : ""} selectionnee
                {selectedIds.length > 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:border-white/20 hover:text-white"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleInsert}
                  disabled={selectedIds.length === 0 || saving}
                  className="inline-flex items-center gap-2 rounded-full bg-[#C9A84C] px-5 py-2.5 text-sm font-semibold text-[#0A0A08] transition hover:bg-[#E8C97A] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {saving ? "Ajout..." : "Ajouter la selection"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
