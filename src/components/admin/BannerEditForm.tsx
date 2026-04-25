"use client";

import Image from "next/image";
import { useRef, useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Loader2, Upload } from "lucide-react";
import {
  DEFAULT_BANNER_CTA_HREF,
  normalizeBannerCtaHref,
} from "@/features/banners/utils";
import { heroBackgroundImage } from "@/lib/images/cloudinary";

export type BannerEditData = {
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

const fieldCls =
  "w-full px-4 py-2.5 rounded-apple-md border border-apple-gray-200 text-sm text-apple-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/30";

const labelCls =
  "block text-xs font-semibold text-apple-gray-500 uppercase tracking-wider mb-1.5";

export function BannerEditForm({ banner }: { banner: BannerEditData }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    imageUrl: banner.imageUrl,
    eyebrow: banner.eyebrow,
    showEyebrow: banner.showEyebrow,
    title: banner.title,
    subtitle: banner.subtitle,
    ctaLabel: banner.ctaLabel || "Découvrir",
    ctaHref: normalizeBannerCtaHref(banner.ctaHref),
    sortOrder: String(banner.sortOrder),
    isActive: banner.isActive,
  });

  const setField = <Key extends keyof typeof form>(
    key: Key,
    value: (typeof form)[Key]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/admin/upload", { method: "POST", body: data });
      const json = await res.json().catch(() => ({ error: "Échec de l'upload" }));

      if (!res.ok) {
        throw new Error(json.error ?? "Échec de l'upload");
      }

      setField("imageUrl", json.url);
      event.target.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Échec de l'upload");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSaved(false);

    const title = form.title.trim();
    const imageUrl = form.imageUrl.trim();
    const sortOrder = Number.parseInt(form.sortOrder, 10);

    if (!title || !imageUrl) {
      setError("Image et titre requis.");
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/admin/banners/${banner.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          eyebrow: form.eyebrow.trim(),
          showEyebrow: form.showEyebrow,
          title,
          subtitle: form.subtitle.trim(),
          ctaLabel: form.ctaLabel.trim() || "Découvrir",
          ctaHref: normalizeBannerCtaHref(form.ctaHref),
          sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
          isActive: form.isActive,
        }),
      });
      const body = await res.json().catch(() => ({ error: "Sauvegarde impossible" }));

      if (!res.ok) {
        setError(body.error ?? "Sauvegarde impossible");
        return;
      }

      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 3000);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-apple-gray-200 rounded-apple-lg overflow-hidden">
        <div className="relative h-72 bg-apple-gray-100">
          {form.imageUrl ? (
            <Image
              src={heroBackgroundImage(form.imageUrl)}
              alt={form.title || "Aperçu bannière"}
              fill
              className="object-cover"
              priority
            />
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-apple-gray-400">
              Aucune image sélectionnée
            </div>
          )}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading || isPending}
            className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-apple-gray-800 shadow-sm hover:bg-white disabled:opacity-60 transition-colors"
          >
            {uploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            {uploading ? "Upload..." : "Changer l'image"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
        </div>

        <div className="p-6 space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelCls}>Eyebrow / petit texte</label>
              <input
                className={fieldCls}
                value={form.eyebrow}
                onChange={(event) => setField("eyebrow", event.target.value)}
                placeholder="Nouvelle collection"
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Affichage de l&apos;eyebrow</label>
              <button
                type="button"
                onClick={() => setField("showEyebrow", !form.showEyebrow)}
                className={`inline-flex h-[42px] items-center gap-3 rounded-apple-md border px-4 text-sm font-medium transition-colors ${
                  form.showEyebrow
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-apple-gray-200 bg-apple-gray-50 text-apple-gray-500"
                }`}
              >
                <span
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    form.showEyebrow ? "bg-green-500" : "bg-apple-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      form.showEyebrow ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
                {form.showEyebrow ? "Afficher" : "Masquer"}
              </button>
            </div>
            <div>
              <label className={labelCls}>Titre *</label>
              <input
                className={fieldCls}
                value={form.title}
                onChange={(event) => setField("title", event.target.value)}
                required
                placeholder="Coffret Lumiere - Edition limitee"
              />
            </div>
            <div>
              <label className={labelCls}>Sous-titre</label>
              <input
                className={fieldCls}
                value={form.subtitle}
                onChange={(event) => setField("subtitle", event.target.value)}
                placeholder="Jusqu'à -20% ce mois-ci"
              />
            </div>
            <div>
              <label className={labelCls}>Texte du bouton</label>
              <input
                className={fieldCls}
                value={form.ctaLabel}
                onChange={(event) => setField("ctaLabel", event.target.value)}
                placeholder="Découvrir"
              />
            </div>
            <div>
              <label className={labelCls}>Lien du bouton</label>
              <input
                className={fieldCls}
                value={form.ctaHref}
                onChange={(event) => setField("ctaHref", event.target.value)}
                placeholder={DEFAULT_BANNER_CTA_HREF}
              />
            </div>
            <div>
              <label className={labelCls}>Ordre d&apos;affichage</label>
              <input
                className={fieldCls}
                type="number"
                min={0}
                step={1}
                value={form.sortOrder}
                onChange={(event) => setField("sortOrder", event.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Statut</label>
              <button
                type="button"
                onClick={() => setField("isActive", !form.isActive)}
                className={`inline-flex h-[42px] items-center gap-3 rounded-apple-md border px-4 text-sm font-medium transition-colors ${
                  form.isActive
                    ? "border-green-200 bg-green-50 text-green-700"
                    : "border-apple-gray-200 bg-apple-gray-50 text-apple-gray-500"
                }`}
              >
                <span
                  className={`relative h-5 w-9 rounded-full transition-colors ${
                    form.isActive ? "bg-green-500" : "bg-apple-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
                      form.isActive ? "translate-x-4" : "translate-x-0.5"
                    }`}
                  />
                </span>
                {form.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-apple-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {saved && (
            <div className="rounded-apple-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-center gap-2">
              <Check className="w-4 h-4" />
              Bannière mise à jour avec succès.
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/admin/banners")}
          className="inline-flex items-center gap-2 text-sm text-apple-gray-500 hover:text-apple-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux bannières
        </button>
        <button
          type="submit"
          disabled={isPending || uploading}
          className="btn-primary px-6 py-2.5 text-sm inline-flex items-center gap-2 disabled:opacity-60"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Sauvegarde..." : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
