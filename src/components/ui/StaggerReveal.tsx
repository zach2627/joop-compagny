"use client";

import { Children, type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

interface StaggerRevealProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}

export function StaggerReveal({
  children,
  className,
  stagger = 0.12,
  delay = 0,
}: StaggerRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      variants={{
        hidden: {},
        visible: {
          transition: prefersReducedMotion
            ? {}
            : {
                staggerChildren: stagger,
                delayChildren: delay,
              },
        },
      }}
    >
      {Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: prefersReducedMotion
              ? { opacity: 1, y: 0 }
              : { opacity: 0, y: 22 },
            visible: {
              opacity: 1,
              y: 0,
              transition: {
                duration: 0.85,
                ease: [0.22, 1, 0.36, 1],
              },
            },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
