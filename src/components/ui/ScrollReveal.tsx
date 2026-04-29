"use client";

import { type ReactNode, useRef } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";

interface Props {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  scale?: number;
  once?: boolean;
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  y = 28,
  scale = 0.985,
  once = true,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, {
    once,
    margin: "0px 0px -80px 0px",
  });
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={
        prefersReducedMotion
          ? { opacity: 1, y: 0, scale: 1 }
          : { opacity: 0, y, scale }
      }
      animate={inView ? { opacity: 1, y: 0, scale: 1 } : undefined}
      transition={{
        duration: 0.9,
        delay: delay / 1000,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
