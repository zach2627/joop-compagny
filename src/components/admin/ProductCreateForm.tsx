"use client";

import Image from "next/image";
import { useState, useTransition, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus, Star, Trash2, Upload } from "lucide-react";
import { createProductAction } from "@/features/products/actions";

type CategoryOption = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type VariantRow = {
  key: string;
  name: string;
  price: string;
  stock: string;
  color: string;
  colorHex: string;
  storage: string;
};

type PendingImage = {
  key: string;
  url: string;
  alt: string;
  color: string;
  isPrimary: boolean;
};

const fieldCls =
  "w-full rounded-xl border border-white/10 bg-[#11141b] px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-[#C9A84C]/60 focus:ring-2 focus:ring-[#C9A84C]/20";

const labelCls =
  "mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-white/45";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function newVariant(price = ""): VariantRow {
  return {
    key: `variant-${crypto.randomUUID()}`,
    name: "",
    price,
    stock: "0",
    color: "",
    colorHex: "#000000",
    storage: "",
  };
}

function fileAlt(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

export function ProductCreateForm({
  categories,
}: {
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [slugTouched, setSlugTouched] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? "");
  const [isActive, setIsActive] = useState(true);
  const [variants, setVariants] = useState<VariantRow[]>(() => [newVariant()]);
  const [images, setImages] = useState<PendingImage[]>([]);

  const colorOptions = Array.from(
    new Set(
      variants
        .map((variant) => variant.color.trim())
        .filter((color): color is string => Boolean(color))
    )
  );

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const updateVariant = (
    key: string,
    field: keyof Omit<VariantRow, "key">,
    value: string
  ) => {
    setVariants((prev) =>
      prev.map((variant) =>
        variant.key === key ? { ...variant, [field]: value } : variant
      )
    );
  };

  const addVariant = () => {
    setVariants((prev) => [...prev, newVariant(basePrice)]);
  };

  const removeVariant = (key: string) => {
    setVariants((prev) =>
      prev.length === 1 ? prev : prev.filter((variant) => variant.key !== key)
    );
  };

  const setPrimaryImage = (key: string) => {
    setImages((prev) =>
      prev.map((image) => ({ ...image, isPrimary: image.key === key }))
    );
  };

  const updateImage = (
    key: string,
    field: keyof Omit<PendingImage, "key">,
    value: string | boolean
  ) => {
    setImages((prev) =>
      prev.map((image) =>
        image.key === key ? { ...image, [field]: value } : image
      )
    );
  };

  const removeImage = (key: string) => {
    setImages((prev) => {
      const next = prev.filter((image) => image.key !== key);
      if (next.length > 0 && !next.some((image) => image.isPrimary)) {
        next[0] = { ...next[0], isPrimary: true };
      }
      return next;
    });
  };

  const handleImageSelection = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files?.length) return;

    setImageError(null);
    setImageUploading(true);

    const targetSlug = slug || slugify(name) || `produit-${Date.now()}`;
    const uploadedImages: PendingImage[] = [];

    try {
      for (const file of Array.from(files)) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          throw new Error("Formats acceptes : JPEG, PNG, WebP.");
        }
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          throw new Error(`Chaque image doit faire moins de ${MAX_SIZE_MB} Mo.`);
        }

        const form = new FormData();
        form.append("file", file);

        const response = await fetch(`/api/admin/upload?folder=products/${targetSlug}`, {
          method: "POST",
          body: form,
        });

        if (!response.ok) {
          const payload = await response.json().catch(() => null);
          throw new Error(payload?.error ?? "Echec de l'upload Cloudinary.");
        }

        const payload = await response.json();
        uploadedImages.push({
          key: `image-${crypto.randomUUID()}`,
          url: payload.url,
          alt: fileAlt(file.name),
          color: "",
          isPrimary: false,
        });
      }

      setImages((prev) => {
        const next = [...prev, ...uploadedImages];
        if (next.length > 0 && !next.some((image) => image.isPrimary)) {
          next[0] = { ...next[0], isPrimary: true };
        }
        return next;
      });
    } catch (uploadError) {
      setImageError(uploadError instanceof Error ? uploadError.message : "Upload impossible.");
    } finally {
      setImageUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (variants.length === 0) {
      setError("Ajoutez au moins une variante.");
      return;
    }

    const formData = new FormData();
    formData.set("name", name);
    formData.set("slug", slug);
    formData.set("shortDescription", shortDescription);
    formData.set("description", description);
    formData.set("basePrice", basePrice);
    formData.set("categoryId", categoryId);
    formData.set("isActive", String(isActive));
    formData.set(
      "variants",
      JSON.stringify(
        variants.map(({ key: _, ...variant }) => ({
          ...variant,
          price: Number(variant.price),
          stock: Number(variant.stock),
        }))
      )
    );
    formData.set(
      "images",
      JSON.stringify(
        images.map(({ key: _, ...image }) => ({
          ...image,
          alt: image.alt.trim(),
          color: image.color.trim(),
        }))
      )
    );

    startTransition(async () => {
      const result = await createProductAction(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }

      router.push("/admin/produits");
      router.refresh();
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-6 shadow-2xl shadow-black/30">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-[#C9A84C]">
              Nouveau catalogue
            </p>
            <h2 className="text-xl font-semibold text-white">Informations produit</h2>
            <p className="mt-1 text-sm text-white/45">
              Le produit sera ajoute avec ses variantes et ses premieres images.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive((value) => !value)}
            className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-300"
                : "border-white/10 bg-white/5 text-white/45"
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isActive ? "bg-emerald-300" : "bg-white/30"
              }`}
            />
            {isActive ? "Actif" : "Inactif"}
          </button>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className={labelCls}>Nom du produit *</label>
            <input
              className={fieldCls}
              value={name}
              onChange={(event) => handleNameChange(event.target.value)}
              required
              placeholder="Coffret Lumiere de Dakar"
            />
          </div>

          <div>
            <label className={labelCls}>Slug *</label>
            <input
              className={fieldCls}
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(slugify(event.target.value));
              }}
              required
              pattern="[a-z0-9-]+"
              placeholder="coffret-lumiere-dakar"
            />
          </div>

          <div>
            <label className={labelCls}>Prix de base (XOF) *</label>
            <input
              className={fieldCls}
              type="number"
              min={1}
              step={1}
              value={basePrice}
              onChange={(event) => setBasePrice(event.target.value)}
              required
              placeholder="25000"
            />
          </div>

          <div>
            <label className={labelCls}>Categorie *</label>
            <select
              className={fieldCls}
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              required
              disabled={categories.length === 0}
            >
              {categories.length === 0 ? (
                <option value="">Aucune categorie disponible</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                    {category.isActive ? "" : " (inactive)"}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Description courte</label>
            <input
              className={fieldCls}
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              maxLength={300}
              placeholder="Resume affiche dans les listes de produits"
            />
            <p className="mt-2 text-xs text-white/30">{shortDescription.length}/300</p>
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Description longue</label>
            <textarea
              className={`${fieldCls} min-h-36 resize-y`}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Description detaillee du produit..."
            />
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-6 shadow-2xl shadow-black/30">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Variantes</h2>
            <p className="mt-1 text-sm text-white/45">
              Ajoutez au moins une variante avec prix, stock, couleur et format.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-2 rounded-full border border-[#C9A84C]/40 px-4 py-2 text-sm font-semibold text-[#E8C97A] transition hover:bg-[#C9A84C]/10"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        <div className="space-y-4">
          {variants.map((variant, index) => (
            <div
              key={variant.key}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
            >
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-white">Variante {index + 1}</p>
                  {index === 0 && (
                    <p className="text-xs text-[#C9A84C]">Definie par defaut</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeVariant(variant.key)}
                  disabled={variants.length === 1}
                  className="rounded-full p-2 text-white/35 transition hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
                  aria-label="Supprimer cette variante"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                <div className="lg:col-span-2">
                  <label className={labelCls}>Nom variante *</label>
                  <input
                    className={fieldCls}
                    value={variant.name}
                    onChange={(event) =>
                      updateVariant(variant.key, "name", event.target.value)
                    }
                    required
                    placeholder="Parfum signature - 100 ml"
                  />
                </div>
                <div>
                  <label className={labelCls}>Prix *</label>
                  <input
                    className={fieldCls}
                    type="number"
                    min={1}
                    step={1}
                    value={variant.price}
                    onChange={(event) =>
                      updateVariant(variant.key, "price", event.target.value)
                    }
                    required
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label className={labelCls}>Stock *</label>
                  <input
                    className={fieldCls}
                    type="number"
                    min={0}
                    step={1}
                    value={variant.stock}
                    onChange={(event) =>
                      updateVariant(variant.key, "stock", event.target.value)
                    }
                    required
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className={labelCls}>Format</label>
                  <input
                    className={fieldCls}
                    value={variant.storage}
                    onChange={(event) =>
                      updateVariant(variant.key, "storage", event.target.value)
                    }
                    placeholder="100 ml / Coffret / Set"
                  />
                </div>
                <div className="lg:col-span-2">
                  <label className={labelCls}>Couleur</label>
                  <input
                    className={fieldCls}
                    value={variant.color}
                    onChange={(event) =>
                      updateVariant(variant.key, "color", event.target.value)
                    }
                    placeholder="Ambre, Or, Noir..."
                  />
                </div>
                <div>
                  <label className={labelCls}>Couleur hex</label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      value={variant.colorHex}
                      onChange={(event) =>
                        updateVariant(variant.key, "colorHex", event.target.value)
                      }
                      className="h-[46px] w-14 rounded-xl border border-white/10 bg-[#11141b] p-1"
                    />
                    <input
                      className={`${fieldCls} font-mono`}
                      value={variant.colorHex}
                      onChange={(event) =>
                        updateVariant(variant.key, "colorHex", event.target.value)
                      }
                      maxLength={7}
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-[#0b0d12] p-6 shadow-2xl shadow-black/30">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Images Cloudinary</h2>
            <p className="mt-1 text-sm text-white/45">
              Uploadez les images produit avant la creation. La premiere image devient principale.
            </p>
          </div>
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#C9A84C]/40 px-4 py-2 text-sm font-semibold text-[#E8C97A] transition hover:bg-[#C9A84C]/10">
            {imageUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Upload...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Ajouter des images
              </>
            )}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={handleImageSelection}
              disabled={imageUploading}
            />
          </label>
        </div>

        {images.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center text-sm text-white/35">
            Aucune image uploadee pour le moment.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {images.map((image) => (
              <div
                key={image.key}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 space-y-4"
              >
                <div className="relative aspect-square overflow-hidden rounded-2xl border border-white/10 bg-black/20">
                  <Image
                    src={image.url}
                    alt={image.alt || "Image produit"}
                    fill
                    sizes="(min-width: 1280px) 18rem, (min-width: 768px) 40vw, 100vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(image.key)}
                    className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                      image.isPrimary
                        ? "bg-[#C9A84C] text-black"
                        : "border border-white/10 bg-white/5 text-white/60 hover:bg-white/10"
                    }`}
                  >
                    <Star className={`h-3.5 w-3.5 ${image.isPrimary ? "fill-current" : ""}`} />
                    {image.isPrimary ? "Image principale" : "Definir principale"}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(image.key)}
                    className="rounded-full p-2 text-white/35 transition hover:bg-red-500/10 hover:text-red-300"
                    aria-label="Retirer cette image"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div>
                  <label className={labelCls}>Texte alternatif</label>
                  <input
                    className={fieldCls}
                    value={image.alt}
                    onChange={(event) => updateImage(image.key, "alt", event.target.value)}
                    placeholder="Description courte de l'image"
                  />
                </div>

                <div>
                  <label className={labelCls}>Couleur associee</label>
                  {colorOptions.length > 0 ? (
                    <select
                      className={fieldCls}
                      value={image.color}
                      onChange={(event) => updateImage(image.key, "color", event.target.value)}
                    >
                      <option value="">Aucune</option>
                      {colorOptions.map((color) => (
                        <option key={color} value={color}>
                          {color}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className={fieldCls}
                      value={image.color}
                      onChange={(event) => updateImage(image.key, "color", event.target.value)}
                      placeholder="Optionnel"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {imageError && (
          <div className="mt-4 rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {imageError}
          </div>
        )}
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/produits")}
          className="inline-flex items-center gap-2 text-sm font-medium text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux produits
        </button>
        <button
          type="submit"
          disabled={isPending || imageUploading || categories.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] px-6 py-3 text-sm font-bold text-black transition hover:shadow-lg hover:shadow-[#C9A84C]/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          {isPending ? "Creation..." : "Creer le produit"}
        </button>
      </div>
    </form>
  );
}
