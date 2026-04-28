"use client";

import Image from "next/image";
import { useState } from "react";

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  productName?: string;
  priority?: boolean;
}

export function ImageWithFallback({
  src,
  alt,
  fill,
  width,
  height,
  sizes,
  className,
  productName,
  priority,
}: ImageWithFallbackProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full h-full gap-2"
        style={{ background: "#1A1A14" }}
      >
        <svg
          viewBox="0 0 24 24"
          className="w-10 h-10 opacity-30"
          style={{ fill: "#C9A84C" }}
          aria-hidden="true"
        >
          <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 3a2 2 0 110 4 2 2 0 010-4zm0 14.5c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
        {productName && (
          <span
            className="text-xs italic text-center px-4 line-clamp-2"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            {productName}
          </span>
        )}
      </div>
    );
  }

  const props = fill
    ? { fill: true as const, sizes }
    : { width: width!, height: height! };

  return (
    <Image
      src={src}
      alt={alt}
      {...props}
      className={className}
      priority={priority}
      onError={() => setError(true)}
    />
  );
}
