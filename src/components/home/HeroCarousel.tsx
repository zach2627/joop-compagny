"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { normalizeBannerCtaHref } from "@/features/banners/utils";

interface Slide {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string | null;
  ctaLabel?: string | null;
  ctaHref?: string | null;
}

interface HeroCarouselProps {
  slides: Slide[];
}

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const goTo = useCallback(
    (index: number, dir: "next" | "prev") => {
      if (animating || index === current) return;
      setDirection(dir);
      setPrev(current);
      setCurrent(index);
      setAnimating(true);
    },
    [animating, current]
  );

  const next = useCallback(() => {
    const nextIndex = (current + 1) % slides.length;
    goTo(nextIndex, "next");
  }, [current, slides.length, goTo]);

  const prev_ = useCallback(() => {
    const prevIndex = (current - 1 + slides.length) % slides.length;
    goTo(prevIndex, "prev");
  }, [current, slides.length, goTo]);

  // Auto-advance
  useEffect(() => {
    if (slides.length <= 1 || paused) return;
    timerRef.current = setTimeout(next, 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [current, paused, next, slides.length]);

  // Reset animation flag
  useEffect(() => {
    if (!animating) return;
    const t = setTimeout(() => {
      setAnimating(false);
      setPrev(null);
    }, 700);
    return () => clearTimeout(t);
  }, [animating]);

  if (!slides.length) return null;

  const slide = slides[current];
  const prevSlide = prev !== null ? slides[prev] : null;

  // Slide animation offset
  const enterX = direction === "next" ? "100%" : "-100%";
  const exitX = direction === "next" ? "-100%" : "100%";

  return (
    <>
      <style>{`
        @keyframes slideEnter {
          from { transform: translateX(var(--enter-x)); opacity: 0.6; }
          to   { transform: translateX(0);              opacity: 1; }
        }
        @keyframes slideExit {
          from { transform: translateX(0);             opacity: 1; }
          to   { transform: translateX(var(--exit-x)); opacity: 0; }
        }
        @keyframes fadeUpIn {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUpIn2 {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .joop-hero-enter {
          animation: slideEnter 0.7s cubic-bezier(0.76, 0, 0.24, 1) forwards;
        }
        .joop-hero-exit {
          animation: slideExit 0.7s cubic-bezier(0.76, 0, 0.24, 1) forwards;
        }
        .joop-text-title {
          animation: fadeUpIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.2s both;
        }
        .joop-text-sub {
          animation: fadeUpIn2 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.35s both;
        }
        .joop-text-cta {
          animation: scaleIn 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
        }
        .joop-dot-active::after {
          content: '';
          display: block;
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: #C9A84C;
          animation: dotFill 5s linear forwards;
        }
        @keyframes dotFill {
          from { transform: scaleX(0); transform-origin: left; }
          to   { transform: scaleX(1); transform-origin: left; }
        }
      `}</style>

      <div
        className="relative w-full overflow-hidden rounded-2xl select-none"
        style={{ aspectRatio: "21/8", minHeight: "300px", maxHeight: "560px", background: "#111" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* ── EXIT slide ── */}
        {prevSlide && animating && (
          <div
            className="joop-hero-exit absolute inset-0"
            style={{ "--exit-x": exitX } as React.CSSProperties}
          >
            <SlideContent slide={prevSlide} active={false} />
          </div>
        )}

        {/* ── ENTER / ACTIVE slide ── */}
        <div
          key={slide.id}
          className={animating ? "joop-hero-enter absolute inset-0" : "absolute inset-0"}
          style={animating ? ({ "--enter-x": enterX } as React.CSSProperties) : {}}
        >
          <SlideContent slide={slide} active={true} />
        </div>

        {/* ── PREV / NEXT arrows ── */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prev_}
              aria-label="Slide précédent"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center
                         w-10 h-10 rounded-full transition-all duration-200
                         hover:scale-110 active:scale-95"
              style={{
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(201,168,76,0.3)",
                backdropFilter: "blur(8px)",
                color: "#C9A84C",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={next}
              aria-label="Slide suivant"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center
                         w-10 h-10 rounded-full transition-all duration-200
                         hover:scale-110 active:scale-95"
              style={{
                background: "rgba(0,0,0,0.45)",
                border: "1px solid rgba(201,168,76,0.3)",
                backdropFilter: "blur(8px)",
                color: "#C9A84C",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}

        {/* ── DOTS ── */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                onClick={() => goTo(i, i > current ? "next" : "prev")}
                aria-label={`Aller au slide ${i + 1}`}
                className="relative overflow-hidden rounded-full transition-all duration-300"
                style={{
                  width: i === current ? "28px" : "6px",
                  height: "6px",
                  background: i === current ? "rgba(201,168,76,0.3)" : "rgba(255,255,255,0.25)",
                }}
              >
                {i === current && (
                  <span
                    key={`dot-${current}-${paused}`}
                    className="joop-dot-active absolute inset-0 rounded-full overflow-hidden"
                    style={{ animationPlayState: paused ? "paused" : "running" }}
                  />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function SlideContent({ slide, active }: { slide: Slide; active: boolean }) {
  const ctaHref = normalizeBannerCtaHref(slide.ctaHref);

  return (
    <div className="relative w-full h-full overflow-hidden rounded-2xl">
      {/* Background image */}
      <Image
        src={slide.imageUrl}
        alt={slide.title}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 90vw"
        className="object-cover"
        style={{ transform: "scale(1.02)" }}
      />

      {/* Gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.08) 100%)",
        }}
      />

      {/* Gold vignette bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-1/3 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(10,8,0,0.55) 0%, transparent 100%)",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="px-8 md:px-14 max-w-2xl">
          {active && (
            <>
              {/* Title */}
              <h2
                className="joop-text-title font-black leading-[1.0] mb-3"
                style={{
                  fontSize: "clamp(1.8rem, 4.5vw, 3.5rem)",
                  color: "#FFFFFF",
                  letterSpacing: "-0.03em",
                  textShadow: "0 2px 20px rgba(0,0,0,0.5)",
                }}
              >
                {slide.title}
              </h2>

              {/* Subtitle */}
              {slide.subtitle && (
                <p
                  className="joop-text-sub text-sm md:text-base mb-6 max-w-sm leading-relaxed"
                  style={{ color: "rgba(210,210,215,0.85)" }}
                >
                  {slide.subtitle}
                </p>
              )}

              {/* CTA */}
              {slide.ctaLabel && ctaHref && (
                <div className="joop-text-cta">
                  <Link
                    href={ctaHref}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold
                               transition-all duration-300 hover:gap-3 hover:scale-105 active:scale-95"
                    style={{
                      background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                      color: "#000",
                      boxShadow: "0 4px 24px rgba(201,168,76,0.35)",
                    }}
                  >
                    {slide.ctaLabel}
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M3 7h8M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
