"use client";

import { useRef, useState } from "react";
import { Image as ImageIcon, Loader2 } from "lucide-react";

type MediaLibraryWidget = { show: () => void; hide: () => void };

// Extend window for the Cloudinary Media Library Widget script
declare global {
  interface Window {
    cloudinary?: {
      createMediaLibrary: (config: Record<string, unknown>, handlers: Record<string, unknown>) => MediaLibraryWidget;
    };
  }
}

interface SelectedAsset {
  secure_url: string;
  public_id: string;
}

interface Props {
  productId: string;
  pendingColor?: string;
  onImagesAdded?: () => void;
}

export function CloudinaryMediaLibrary({ productId, pendingColor, onImagesAdded }: Props) {
  const [scriptLoading, setScriptLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const widgetRef = useRef<MediaLibraryWidget | null>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;

  const buildWidget = (): MediaLibraryWidget | null => {
    if (!window.cloudinary || !cloudName || !apiKey) return null;

    const widget = window.cloudinary.createMediaLibrary(
      {
        cloud_name: cloudName,
        api_key: apiKey,
        multiple: true,
        max_files: 5,
        folder: { path: "joop_compagny", resource_type: "image" },
        default_transformations: [[]],
      },
      {
        insertHandler: async (data: { assets: SelectedAsset[] }) => {
          setSaving(true);
          setError("");
          try {
            await Promise.all(
              data.assets.map((asset) =>
                fetch("/api/products/images", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    productId,
                    url: asset.secure_url,
                    alt: asset.public_id.split("/").pop() ?? null,
                    color: pendingColor?.trim() || null,
                  }),
                })
              )
            );
            onImagesAdded?.();
          } catch (err) {
            setError(String(err));
          } finally {
            setSaving(false);
          }
        },
      }
    );

    widgetRef.current = widget;
    return widget;
  };

  const handleOpen = () => {
    setError("");

    // Widget already initialised — show directly
    if (widgetRef.current) {
      widgetRef.current.show();
      return;
    }

    // Script already in the page — just rebuild widget
    if (window.cloudinary) {
      buildWidget()?.show();
      return;
    }

    // First click: load the script lazily
    setScriptLoading(true);
    const script = document.createElement("script");
    script.src = "https://media-library.cloudinary.com/global/all.js";
    script.onload = () => {
      setScriptLoading(false);
      buildWidget()?.show();
    };
    script.onerror = () => {
      setScriptLoading(false);
      setError("Impossible de charger le widget Cloudinary.");
    };
    document.head.appendChild(script);
  };

  const isBusy = scriptLoading || saving;

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={handleOpen}
        disabled={isBusy}
        className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-all"
        style={{
          color: isBusy ? "rgba(255,255,255,0.5)" : "#C9A84C",
          borderColor: isBusy ? "rgba(255,255,255,0.14)" : "rgba(201,168,76,0.4)",
          background: "rgba(201,168,76,0.04)",
        }}
      >
        {isBusy ? (
          <>
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            {saving ? "Sauvegarde..." : "Chargement..."}
          </>
        ) : (
          <>
            <ImageIcon className="h-3.5 w-3.5" />
            Choisir depuis Cloudinary
          </>
        )}
      </button>
      {error ? <p className="max-w-[260px] text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
