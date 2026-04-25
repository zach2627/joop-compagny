"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type HeroVisualSlide = {
  imageUrl: string;
  href: string;
  title: string;
};

interface HeroVisualCarouselProps {
  slides: HeroVisualSlide[];
}

const AUTOPLAY_MS = 5600;

export function HeroVisualCarousel({ slides }: HeroVisualCarouselProps) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTOPLAY_MS);

    return () => window.clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="relative mx-auto w-full">
      <div
        className="relative min-h-[280px] overflow-hidden rounded-[28px] border border-white/10 shadow-[0_24px_80px_rgba(0,0,0,0.45)] sm:min-h-[360px] md:min-h-[440px] lg:min-h-[520px]"
        style={{ aspectRatio: "1705 / 860", background: "#050505" }}
      >
        {slides.map((slide, index) => {
          const isActive = index === current;
          const baseScale = slide.imageUrl.includes("lineup") ? 1.04 : 1.1;

          return (
            <Link
              key={slide.imageUrl}
              href={slide.href}
              aria-label={slide.title}
              className="absolute inset-0 block"
              style={{
                opacity: isActive ? 1 : 0,
                transform: isActive
                  ? "translate3d(0,0,0) scale(1)"
                  : "translate3d(28px,0,0) scale(1.035)",
                filter: isActive ? "blur(0px)" : "blur(10px)",
                transition:
                  "opacity 1.15s cubic-bezier(0.22,1,0.36,1), transform 1.35s cubic-bezier(0.22,1,0.36,1), filter 1.15s cubic-bezier(0.22,1,0.36,1)",
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <Image
                src={slide.imageUrl}
                alt={slide.title}
                fill
                priority={index === 0}
                className="object-cover object-center"
                style={{
                  transform: `scale(${isActive ? baseScale : baseScale + 0.05})`,
                  transition:
                    "transform 1.35s cubic-bezier(0.22,1,0.36,1)",
                }}
                sizes="100vw"
              />
            </Link>
          );
        })}

        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28"
          style={{
            background:
              "linear-gradient(to top, rgba(5,5,5,0.78) 0%, rgba(5,5,5,0.18) 45%, transparent 100%)",
          }}
        />
      </div>

      {slides.length > 1 ? (
        <div className="absolute inset-x-0 bottom-4 z-10 flex justify-center">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-2 backdrop-blur-md">
            {slides.map((slide, index) => {
              const isActive = index === current;

              return (
                <button
                  key={`${slide.imageUrl}-dot`}
                  type="button"
                  onClick={() => setCurrent(index)}
                  className="transition-all duration-300"
                  aria-label={`Afficher la bannière ${index + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  style={{
                    width: isActive ? 28 : 8,
                    height: 8,
                    borderRadius: 999,
                    background: isActive ? "#C9A84C" : "rgba(255,255,255,0.36)",
                    boxShadow: isActive
                      ? "0 0 18px rgba(201,168,76,0.45)"
                      : "none",
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
