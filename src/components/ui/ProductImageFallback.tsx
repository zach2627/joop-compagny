"use client";

import Image from "next/image";
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
          background:
            "linear-gradient(180deg, rgba(22,20,15,0.96) 0%, rgba(12,12,9,0.94) 100%)",
          color: "var(--color-text)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center"
          aria-hidden="true"
        >
          <div
            className="flex h-14 w-14 items-center justify-center rounded-full"
            style={{
              border: "1px solid rgba(201,168,76,0.34)",
              background: "rgba(201,168,76,0.08)",
              color: "#e8c97a",
            }}
          >
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3.5L19.5 12L12 20.5L4.5 12L12 3.5Z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
              <path
                d="M8.5 8.5L12 12L15.5 8.5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        <div
          className="absolute inset-x-0 bottom-0 px-4 pb-4 pt-10 text-center"
          style={{
            background:
              "linear-gradient(180deg, rgba(10,10,8,0) 0%, rgba(10,10,8,0.74) 44%, rgba(10,10,8,0.96) 100%)",
          }}
        >
          <span
            className="block"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontStyle: "italic",
              fontSize: "1.05rem",
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
