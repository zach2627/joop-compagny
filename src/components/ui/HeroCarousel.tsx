// src/components/ui/HeroCarousel.tsx
"use client";

import { useState, useEffect } from "react";
import { buildCloudinaryUploadUrl, heroBackgroundImage } from "@/lib/images/cloudinary";

const FALLBACK_IMAGES = [
  buildCloudinaryUploadUrl("v1777245305/IMG_8504_yfdqba.jpg"),
  buildCloudinaryUploadUrl("v1777245304/IMG_8501_ughssj.jpg"),
  buildCloudinaryUploadUrl("v1777245308/IMG_8511_c8vowo.jpg"),
];

interface HeroCarouselProps {
  imageUrls?: string[];
}

export function HeroCarousel({ imageUrls = [] }: HeroCarouselProps) {
  const images = (imageUrls.length ? imageUrls : FALLBACK_IMAGES).map((url) =>
    heroBackgroundImage(url)
  );
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
