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

const panel: React.CSSProperties = {
  background: "rgba(17,17,9,0.84)",
  border: "1px solid rgba(201,168,76,0.14)",
  borderRadius: "16px",
};

const inputCls =
  "w-full px-4 py-2.5 rounded-xl border text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all";
const inputStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.04)",
  borderColor: "rgba(201,168,76,0.18)",
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
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          <ImageIcon className="w-5 h-5" style={{ color: "#C9A84C" }} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Bannières</h1>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.46)" }}>
            Gérez le carousel de la page d&apos;accueil
          </p>
        </div>
      </div>

      {/* Add form */}
      <div className="p-6 mb-8" style={panel}>
        <h2
          className="font-semibold mb-4 flex items-center gap-2"
          style={{ color: "rgba(255,255,255,0.86)" }}
        >
          <Plus className="w-4 h-4" style={{ color: "#C9A84C" }} />
          Ajouter une bannière
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors relative overflow-hidden"
            style={{
              minHeight: 160,
              borderColor: "rgba(201,168,76,0.22)",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            {form.imageUrl ? (
              <Image src={heroBackgroundImage(form.imageUrl)} alt="preview" fill className="object-cover rounded-xl" />
            ) : (
              <>
                <Upload className="w-8 h-8 mb-2" style={{ color: "rgba(255,255,255,0.2)" }} />
                <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
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
              className={inputCls}
              style={inputStyle}
            />
            <label
              className="flex items-center justify-between gap-4 px-4 py-2.5 rounded-xl border text-sm"
              style={{ ...inputStyle, color: "rgba(255,255,255,0.6)" }}
            >
              <span>Afficher l&apos;eyebrow</span>
              <input
                type="checkbox"
                checked={form.showEyebrow}
                onChange={(e) => setForm((prev) => ({ ...prev, showEyebrow: e.target.checked }))}
                style={{ accentColor: "#C9A84C" }}
              />
            </label>
            <input
              type="text"
              placeholder="Titre *"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className={inputCls}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Sous-titre"
              value={form.subtitle}
              onChange={(e) => setForm((prev) => ({ ...prev, subtitle: e.target.value }))}
              className={inputCls}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Texte du bouton"
              value={form.ctaLabel}
              onChange={(e) => setForm((prev) => ({ ...prev, ctaLabel: e.target.value }))}
              className={inputCls}
              style={inputStyle}
            />
            <input
              type="text"
              placeholder="Lien du bouton"
              value={form.ctaHref}
              onChange={(e) => setForm((prev) => ({ ...prev, ctaHref: e.target.value }))}
              className={inputCls}
              style={inputStyle}
            />
            <button
              onClick={handleAdd}
              disabled={uploading}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                color: "#0A0A08",
              }}
            >
              Ajouter la bannière
            </button>
            {error && <p className="text-sm text-red-400">{error}</p>}
          </div>
        </div>
      </div>

      {/* Banner list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <p className="text-sm col-span-2 text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>
            Chargement des bannières...
          </p>
        ) : banners.length === 0 ? (
          <p className="text-sm col-span-2 text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>
            Aucune bannière pour l&apos;instant
          </p>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="overflow-hidden" style={panel}>
              <div className="relative h-40">
                <Image src={heroBackgroundImage(banner.imageUrl)} alt={banner.title} fill className="object-cover" />
              </div>
              <div className="p-4 flex items-center justify-between gap-4">
                <div>
                  {banner.showEyebrow && banner.eyebrow ? (
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                      style={{ color: "#C9A84C" }}
                    >
                      {banner.eyebrow}
                    </p>
                  ) : (
                    <p
                      className="text-[10px] font-semibold uppercase tracking-widest mb-1"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      Eyebrow masqué
                    </p>
                  )}
                  <p className="font-medium text-white">{banner.title}</p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.46)" }}>{banner.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/banners/${banner.id}/edit`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
                    style={{
                      color: "#C9A84C",
                      border: "1px solid rgba(201,168,76,0.3)",
                      background: "rgba(201,168,76,0.06)",
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Modifier
                  </Link>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-lg transition-colors"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                    aria-label={`Supprimer ${banner.title}`}
                  >
                    <Trash2 className="w-4 h-4 hover:text-red-400" />
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
