// src/components/ui/HeroCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import { heroBackgroundImage } from "@/lib/images/cloudinary";

const FALLBACK_IMAGES = [
  "/api/img?url=" + encodeURIComponent("https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium?wid=1920&hei=1080&fmt=jpeg&qlt=90"),
  "/api/img?url=" + encodeURIComponent("https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-blacktitanium?wid=1920&hei=1080&fmt=jpeg&qlt=90"),
  "/api/img?url=" + encodeURIComponent("https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-1inch-whitetitanium?wid=1920&hei=1080&fmt=jpeg&qlt=90"),
];

interface HeroCarouselProps {
  imageUrls?: string[];
}

export function HeroCarousel({ imageUrls = [] }: HeroCarouselProps) {
  const images = imageUrls.length
    ? imageUrls.map((url) => heroBackgroundImage(url))
    : FALLBACK_IMAGES;
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setCurrent((prev) => (prev + 1) % images.length), 4000);
    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="absolute inset-0">
      {images.map((url, i) => (
        <div
          key={url}
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `url(${url})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: i === current ? 1 : 0,
            transition: "opacity 1s ease-in-out",
          }}
          aria-hidden="true"
        />
      ))}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(8,8,8,0.3) 0%, rgba(8,8,8,0.1) 35%, rgba(8,8,8,0.65) 100%)",
        }}
      />
    </div>
  );
}
