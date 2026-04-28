"use client";

import Image from "next/image";
import { Gem } from "lucide-react";
import { useState } from "react";

type ProductImageFallbackProps = {
  src?: string | null;
  alt: string;
  label: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  imageClassName?: string;
  fallbackClassName?: string;
};

export function ProductImageFallback({
  src,
  alt,
  label,
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  imageClassName,
  fallbackClassName,
}: ProductImageFallbackProps) {
  const [broken, setBroken] = useState(false);

  if (!src || broken) {
    return (
      <div
        className={fallbackClassName}
        style={{
          background: "#1A1A14",
          color: "#FFFFFF",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "1.25rem",
        }}
      >
        <div className="flex max-w-[16rem] flex-col items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-full"
            style={{
              border: "1px solid rgba(201,168,76,0.28)",
              background: "rgba(201,168,76,0.08)",
              color: "#C9A84C",
            }}
          >
            <Gem className="h-5 w-5" />
          </div>
          <span
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontStyle: "italic",
              fontSize: "1rem",
              lineHeight: 1.2,
            }}
          >
            {label}
          </span>
        </div>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      width={fill ? undefined : width}
      height={fill ? undefined : height}
      sizes={sizes}
      priority={priority}
      className={imageClassName}
      onError={() => setBroken(true)}
    />
  );
}
