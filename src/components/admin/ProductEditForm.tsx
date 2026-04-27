// src/components/admin/ProductEditForm.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, Loader2, ChevronLeft, Check } from "lucide-react";
import { updateProductAction } from "@/features/products/actions";

// ─── Types ────────────────────────────────────────────────────────────────────

interface VariantRow {
  _key: string;          // clé React stable
  id?: string;           // undefined = nouvelle variante
  sku: string;
  name: string;
  storage: string;
  color: string;
  colorHex: string;
  price: string;
  compareAt: string;
  stock: string;
  isDefault: boolean;
}

interface ProductData {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  basePrice: string;
  isActive: boolean;
  isFeatured: boolean;
  variants: {
    id: string;
    sku: string;
    name: string;
    storage: string | null;
    color: string | null;
    colorHex: string | null;
    price: number;
    compareAt: number | null;
    stock: number;
    isDefault: boolean;
  }[];
}

// ─── Styles partagés ─────────────────────────────────────────────────────────

const fieldCls =
  "w-full px-3 py-2 border border-apple-gray-200 rounded-apple-md text-sm text-apple-gray-900 focus:outline-none focus:ring-2 focus:ring-apple-blue/30 bg-white";

const labelCls = "block text-xs font-semibold text-apple-gray-600 mb-1 uppercase tracking-wider";

// ─── Composant ───────────────────────────────────────────────────────────────

export function ProductEditForm({ product }: { product: ProductData }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Champs produit
  const [name, setName] = useState(product.name);
  const [slug, setSlug] = useState(product.slug);
  const [description, setDescription] = useState(product.description ?? "");
  const [shortDescription, setShortDescription] = useState(product.shortDescription ?? "");
  const [basePrice, setBasePrice] = useState(product.basePrice);
  const [isActive, setIsActive] = useState(product.isActive);
  const [isFeatured, setIsFeatured] = useState(product.isFeatured);

  // Variantes
  const [variants, setVariants] = useState<VariantRow[]>(() =>
    product.variants.map((v) => ({
      _key: v.id,
      id: v.id,
      sku: v.sku,
      name: v.name,
      storage: v.storage ?? "",
      color: v.color ?? "",
      colorHex: v.colorHex ?? "",
      price: String(v.price),
      compareAt: v.compareAt ? String(v.compareAt) : "",
      stock: String(v.stock),
      isDefault: v.isDefault,
    }))
  );
  const [deletedVariantIds, setDeletedVariantIds] = useState<string[]>([]);

  // Auto-slug depuis le nom
  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(
      val.toLowerCase().trim()
        .replace(/[àâä]/g, "a").replace(/[éèêë]/g, "e").replace(/[îï]/g, "i")
        .replace(/[ôö]/g, "o").replace(/[ùûü]/g, "u").replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
    );
  };

  // Variantes — helpers
  const updateVariant = (key: string, field: keyof VariantRow, value: string | boolean) => {
    setVariants((prev) =>
      prev.map((v) => {
        if (v._key !== key) return v;
        // Quand on coche isDefault, décocher les autres
        if (field === "isDefault" && value === true) {
          return { ...v, isDefault: true };
        }
        return { ...v, [field]: value };
      }).map((v) => {
        if (field === "isDefault" && value === true && v._key !== key) {
          return { ...v, isDefault: false };
        }
        return v;
      })
    );
  };

  const addVariant = () => {
    const key = `new-${Date.now()}`;
    setVariants((prev) => [
      ...prev,
      {
        _key: key,
        sku: "",
        name: "",
        storage: "",
        color: "",
        colorHex: "#000000",
        price: basePrice,
        compareAt: "",
        stock: "0",
        isDefault: prev.length === 0,
      },
    ]);
  };

  const removeVariant = (key: string) => {
    const v = variants.find((r) => r._key === key);
    if (v?.id) setDeletedVariantIds((prev) => [...prev, v.id!]);
    setVariants((prev) => {
      const next = prev.filter((r) => r._key !== key);
      // Si on supprime la variante par défaut, promouvoir la première restante
      if (v?.isDefault && next.length > 0 && !next.some((r) => r.isDefault)) {
        next[0] = { ...next[0], isDefault: true };
      }
      return next;
    });
  };

  // Soumission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("description", description);
    formData.set("shortDescription", shortDescription);
    formData.set("basePrice", basePrice);
    formData.set("isActive", String(isActive));
    formData.set("isFeatured", String(isFeatured));
    formData.set("variants", JSON.stringify(
      variants.map(({ _key: _, ...v }) => ({
        ...v,
        price: Number(v.price),
        compareAt: v.compareAt ? Number(v.compareAt) : undefined,
        stock: Number(v.stock),
      }))
    ));
    formData.set("deletedVariantIds", JSON.stringify(deletedVariantIds));

    startTransition(async () => {
      const result = await updateProductAction(product.id, formData);
      if (result.success) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Section : Informations produit ──────────────────────────────── */}
      <div className="bg-white border border-apple-gray-200 rounded-apple-lg p-6 space-y-5">
        <h2 className="font-semibold text-apple-gray-900 text-base">Informations produit</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Nom */}
          <div>
            <label className={labelCls}>Nom *</label>
            <input
              className={fieldCls}
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              required
              placeholder="Coffret Lumiere de Dakar"
            />
          </div>

          {/* Slug */}
          <div>
            <label className={labelCls}>Slug *</label>
            <input
              className={fieldCls}
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="coffret-lumiere-dakar"
              pattern="[a-z0-9-]+"
              title="Minuscules, chiffres et tirets uniquement"
            />
          </div>

          {/* Prix de base */}
          <div>
            <label className={labelCls}>Prix de base (XOF) *</label>
            <input
              className={fieldCls}
              type="number"
              min={1}
              step="1"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              required
              placeholder="750000"
            />
          </div>

          {/* Statut + Featured */}
          <div className="flex flex-col gap-3 pt-1">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setIsActive((v) => !v)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${isActive ? "bg-green-500" : "bg-apple-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isActive ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm font-medium text-apple-gray-700">
                {isActive ? "Actif" : "Inactif"}
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <div
                onClick={() => setIsFeatured((v) => !v)}
                className={`w-10 h-6 rounded-full transition-colors relative cursor-pointer ${isFeatured ? "bg-apple-blue" : "bg-apple-gray-300"}`}
              >
                <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${isFeatured ? "translate-x-4" : "translate-x-0.5"}`} />
              </div>
              <span className="text-sm font-medium text-apple-gray-700">Produit phare</span>
            </label>
          </div>
        </div>

        {/* Description courte */}
        <div>
          <label className={labelCls}>Description courte</label>
          <input
            className={fieldCls}
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            maxLength={300}
            placeholder="Résumé affiché dans les listes de produits"
          />
          <p className="text-xs text-apple-gray-400 mt-1">{shortDescription.length}/300</p>
        </div>

        {/* Description longue */}
        <div>
          <label className={labelCls}>Description complète</label>
          <textarea
            className={`${fieldCls} resize-y`}
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description détaillée du produit..."
          />
        </div>
      </div>

      {/* ── Section : Variantes ─────────────────────────────────────────── */}
      <div className="bg-white border border-apple-gray-200 rounded-apple-lg p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-apple-gray-900 text-base">
            Variantes <span className="text-apple-gray-400 font-normal text-sm">({variants.length})</span>
          </h2>
          <button
            type="button"
            onClick={addVariant}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-apple-blue text-apple-blue hover:bg-apple-blue/5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Ajouter une variante
          </button>
        </div>

        {variants.length === 0 && (
          <p className="text-sm text-apple-gray-400 text-center py-6 border border-dashed border-apple-gray-200 rounded-apple-md">
            Aucune variante — cliquez sur « Ajouter » pour créer la première.
          </p>
        )}

        <div className="space-y-4">
          {variants.map((v) => (
            <div
              key={v._key}
              className={`border rounded-apple-md p-4 space-y-3 transition-colors ${v.isDefault ? "border-apple-blue bg-apple-blue/5" : "border-apple-gray-200"}`}
            >
              {/* En-tête ligne */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer select-none text-sm font-medium text-apple-gray-700">
                  <input
                    type="radio"
                    name="defaultVariant"
                    checked={v.isDefault}
                    onChange={() => updateVariant(v._key, "isDefault", true)}
                    className="accent-apple-blue"
                  />
                  {v.isDefault ? (
                    <span className="text-apple-blue text-xs font-semibold px-2 py-0.5 bg-apple-blue/10 rounded-full">
                      Par défaut
                    </span>
                  ) : (
                    <span className="text-apple-gray-400 text-xs">Définir par défaut</span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => removeVariant(v._key)}
                  className="p-1.5 rounded-md text-apple-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                  title="Supprimer cette variante"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Champs en grille */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                <div>
                  <label className={labelCls}>SKU *</label>
                  <input
                    className={fieldCls}
                    value={v.sku}
                    onChange={(e) => updateVariant(v._key, "sku", e.target.value)}
                    required
                    placeholder="JC-LUM-3P-OR"
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-2">
                  <label className={labelCls}>Nom variante *</label>
                  <input
                    className={fieldCls}
                    value={v.name}
                    onChange={(e) => updateVariant(v._key, "name", e.target.value)}
                    required
                    placeholder="Coffret Rituel Precieux - 4 pieces - Prune royale"
                  />
                </div>
                <div>
                  <label className={labelCls}>Stockage</label>
                  <input
                    className={fieldCls}
                    value={v.storage}
                    onChange={(e) => updateVariant(v._key, "storage", e.target.value)}
                    placeholder="100 ml / 4 pieces / Taille unique"
                  />
                </div>
                <div>
                  <label className={labelCls}>Couleur</label>
                  <input
                    className={fieldCls}
                    value={v.color}
                    onChange={(e) => updateVariant(v._key, "color", e.target.value)}
                    placeholder="Or sable"
                  />
                </div>
                <div>
                  <label className={labelCls}>Couleur (hex)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={v.colorHex || "#000000"}
                      onChange={(e) => updateVariant(v._key, "colorHex", e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border border-apple-gray-200 p-0.5"
                    />
                    <input
                      className={`${fieldCls} font-mono`}
                      value={v.colorHex}
                      onChange={(e) => updateVariant(v._key, "colorHex", e.target.value)}
                      placeholder="#1C1C1E"
                      maxLength={7}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelCls}>Prix (XOF) *</label>
                  <input
                    className={fieldCls}
                    type="number"
                    min={1}
                    step="1"
                    value={v.price}
                    onChange={(e) => updateVariant(v._key, "price", e.target.value)}
                    required
                    placeholder="850000"
                  />
                </div>
                <div>
                  <label className={labelCls}>Prix barré</label>
                  <input
                    className={fieldCls}
                    type="number"
                    min={1}
                    step="1"
                    value={v.compareAt}
                    onChange={(e) => updateVariant(v._key, "compareAt", e.target.value)}
                    placeholder="950000"
                  />
                </div>
                <div>
                  <label className={labelCls}>Stock *</label>
                  <input
                    className={fieldCls}
                    type="number"
                    min={0}
                    step="1"
                    value={v.stock}
                    onChange={(e) => updateVariant(v._key, "stock", e.target.value)}
                    required
                    placeholder="10"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Feedback + Actions ────────────────────────────────────────────── */}
      {error && (
        <div className="px-4 py-3 rounded-apple-md text-sm"
          style={{ background: "rgba(220,38,38,0.08)", border: "1px solid rgba(220,38,38,0.25)", color: "#dc2626" }}>
          {error}
        </div>
      )}
      {saved && (
        <div className="px-4 py-3 rounded-apple-md text-sm flex items-center gap-2"
          style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#16a34a" }}>
          <Check className="w-4 h-4" />
          Produit mis à jour avec succès.
        </div>
      )}

      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={() => router.push("/admin/produits")}
          className="flex items-center gap-2 text-sm text-apple-gray-500 hover:text-apple-gray-900 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Retour aux produits
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary px-6 py-2.5 text-sm flex items-center gap-2 disabled:opacity-60"
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Sauvegarde..." : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
