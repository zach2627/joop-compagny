"use client";

// src/app/admin/banners/page.tsx
import { useEffect, useRef, useState } from "react";
import { Upload, Trash2, Plus, ImageIcon, Pencil } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  DEFAULT_BANNER_CTA_HREF,
  normalizeBannerCtaHref,
} from "@/features/banners/utils";
import { heroBackgroundImage } from "@/lib/images/cloudinary";

type Banner = {
  id: string;
  imageUrl: string;
  eyebrow: string;
  showEyebrow: boolean;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  sortOrder: number;
  isActive: boolean;
};

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    eyebrow: "",
    showEyebrow: true,
    title: "",
    subtitle: "",
    ctaLabel: "Découvrir",
    ctaHref: DEFAULT_BANNER_CTA_HREF,
    imageUrl: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let active = true;

    async function loadBanners() {
      try {
        const res = await fetch("/api/admin/banners", { cache: "no-store" });
        if (!res.ok) throw new Error("Impossible de charger les bannières");
        const data = (await res.json()) as Banner[];
        if (active) {
          setBanners(
            data.map((banner) => ({
              ...banner,
              ctaHref: normalizeBannerCtaHref(banner.ctaHref),
            }))
          );
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Chargement impossible");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadBanners();

    return () => {
      active = false;
    };
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error ?? "Échec de l'upload");
      }

      setForm((prev) => ({ ...prev, imageUrl: json.url }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleAdd = async () => {
    if (!form.imageUrl || !form.title) {
      setError("Image et titre requis.");
      return;
    }

    setError(null);
    const res = await fetch("/api/admin/banners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        ctaHref: normalizeBannerCtaHref(form.ctaHref),
        sortOrder: banners.length,
      }),
    });
    const banner = await res.json();

    if (!res.ok) {
      setError(banner.error ?? "Impossible d'ajouter la bannière");
      return;
    }

    setBanners((prev) => [...prev, banner]);
    setForm({
      eyebrow: "",
      showEyebrow: true,
      title: "",
      subtitle: "",
      ctaLabel: "Découvrir",
      ctaHref: DEFAULT_BANNER_CTA_HREF,
      imageUrl: "",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cette bannière ?")) return;

    setError(null);
    const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ error: "Suppression impossible" }));
      setError(body.error ?? "Suppression impossible");
      return;
    }

    setBanners((prev) => prev.filter((banner) => banner.id !== id));
  };

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-apple-md bg-apple-blue/10 flex items-center justify-center">
          <ImageIcon className="w-5 h-5 text-apple-blue" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-apple-gray-900">Bannières</h1>
          <p className="text-sm text-apple-gray-500">
            Gérez le carousel de la page d&apos;accueil
          </p>
        </div>
      </div>

      <div className="bg-white rounded-apple-lg border border-apple-gray-200 p-6 mb-8">
        <h2 className="font-semibold text-apple-gray-900 mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" /> Ajouter une bannière
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-apple-gray-200 rounded-apple-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-apple-blue transition-colors relative overflow-hidden"
            style={{ minHeight: 160 }}
          >
            {form.imageUrl ? (
              <Image src={heroBackgroundImage(form.imageUrl)} alt="preview" fill className="object-cover rounded-apple-md" />
            ) : (
              <>
                <Upload className="w-8 h-8 text-apple-gray-300 mb-2" />
                <p className="text-sm text-apple-gray-400">
                  {uploading ? "Upload en cours..." : "Cliquez pour uploader une image"}
                </p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
            />
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Eyebrow / petit texte (ex: Nouvelle collection)"
              value={form.eyebrow}
              onChange={(e) => setForm((prev) => ({ ...prev, eyebrow: e.target.value }))}
              className="px-4 py-2.5 rounded-apple-md border border-apple-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/30"
            />
            <label className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-apple-md border border-apple-gray-200 text-sm text-apple-gray-700">
              <span>Afficher l&apos;eyebrow</span>
              <input
                type="checkbox"
                checked={form.showEyebrow}
                onChange={(e) => setForm((prev) => ({ ...prev, showEyebrow: e.target.checked }))}
                className="accent-apple-blue"
              />
            </label>
            <input
              type="text"
              placeholder="Titre *"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="px-4 py-2.5 rounded-apple-md border border-apple-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/30"
            />
            <input
              type="text"
              placeholder="Sous-titre"
              value={form.subtitle}
              onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
              className="px-4 py-2.5 rounded-apple-md border border-apple-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/30"
            />
            <input
              type="text"
              placeholder="Texte du bouton"
              value={form.ctaLabel}
              onChange={(e) => setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
              className="px-4 py-2.5 rounded-apple-md border border-apple-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/30"
            />
            <input
              type="text"
              placeholder="Lien du bouton"
              value={form.ctaHref}
              onChange={(e) => setForm((prev) => ({ ...prev, ctaHref: e.target.value }))}
              className="px-4 py-2.5 rounded-apple-md border border-apple-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-apple-blue/30"
            />
            <button
              onClick={handleAdd}
              disabled={uploading}
              className="px-4 py-2.5 bg-apple-blue text-white rounded-apple-md text-sm font-medium hover:bg-apple-blue/90 transition-colors disabled:opacity-50"
            >
              Ajouter la bannière
            </button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-apple-gray-400 text-sm col-span-2 text-center py-12">
            Chargement des bannières...
          </p>
        ) : banners.length === 0 ? (
          <p className="text-apple-gray-400 text-sm col-span-2 text-center py-12">
            Aucune bannière pour l&apos;instant
          </p>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="bg-white rounded-apple-lg border border-apple-gray-200 overflow-hidden">
              <div className="relative h-40">
                <Image src={heroBackgroundImage(banner.imageUrl)} alt={banner.title} fill className="object-cover" />
              </div>
              <div className="p-4 flex items-center justify-between gap-4">
                <div>
                  {banner.showEyebrow && banner.eyebrow ? (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-apple-gray-400 mb-1">
                      {banner.eyebrow}
                    </p>
                  ) : (
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-apple-gray-300 mb-1">
                      Eyebrow masqué
                    </p>
                  )}
                  <p className="font-medium text-apple-gray-900">{banner.title}</p>
                  <p className="text-xs text-apple-gray-500">{banner.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/banners/${banner.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-apple-sm text-xs font-medium text-apple-gray-500 border border-apple-gray-200 hover:text-apple-blue hover:border-apple-blue/50 hover:bg-apple-blue/5 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-apple-sm text-apple-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label={`Supprimer ${banner.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
