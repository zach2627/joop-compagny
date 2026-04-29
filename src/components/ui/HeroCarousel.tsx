"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
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
  const prefersReducedMotion = useReducedMotion();
  const images = (imageUrls.length ? imageUrls : FALLBACK_IMAGES).map((url) =>
    heroBackgroundImage(url)
  );
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 5000);

    return () => clearInterval(id);
  }, [images.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={images[current]}
          className="absolute inset-0 pointer-events-none hero-bg"
          initial={
            prefersReducedMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.06 }
          }
          animate={{ opacity: 1, scale: 1 }}
          exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.02 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{
            backgroundImage: `url(${images[current]})`,
          }}
          aria-hidden="true"
        />
      </AnimatePresence>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={false}
        animate={
          prefersReducedMotion
            ? undefined
            : {
                backgroundPosition: ["50% 50%", "48% 42%", "50% 50%"],
              }
        }
        transition={{
          duration: 18,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
        style={{
          background:
            "radial-gradient(circle at 16% 20%, rgba(201,168,76,0.16), transparent 22%), radial-gradient(circle at 84% 16%, rgba(201,168,76,0.1), transparent 24%), linear-gradient(180deg, rgba(10,10,8,0.18) 0%, rgba(10,10,8,0.32) 48%, rgba(10,10,8,0.82) 100%)",
        }}
      />
    </div>
  );
}
