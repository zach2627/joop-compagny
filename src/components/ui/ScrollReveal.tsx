"use client";
// src/components/ui/ScrollReveal.tsx
// Apple-style fade-in + translateY on scroll using IntersectionObserver.

import { useEffect, useRef, CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number; // ms — for staggered children
  y?: number;     // translateY starting offset in px (default 28)
}

export function ScrollReveal({ children, className, delay = 0, y = 28 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => {
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    };

    // If already in viewport on mount (above fold), reveal immediately
    if (el.getBoundingClientRect().top < window.innerHeight - 40) {
      reveal();
      return;
    }

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          obs.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -24px 0px" }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const style: CSSProperties = {
    opacity: 0,
    transform: `translateY(${y}px)`,
    transition: `opacity 0.8s cubic-bezier(0.25, 0, 0, 1) ${delay}ms, transform 0.8s cubic-bezier(0.25, 0, 0, 1) ${delay}ms`,
    willChange: "opacity, transform",
  };

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
