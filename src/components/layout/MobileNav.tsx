"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

interface MobileNavProps {
  navLinks: { href: string; label: string }[];
  labels: {
    menuOpen: string;
    menuClose: string;
  };
}

export function MobileNav({ navLinks, labels }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <motion.button
        className="flex h-11 w-11 items-center justify-center rounded-full md:hidden"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? labels.menuClose : labels.menuOpen}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
        whileTap={{ scale: 0.94 }}
        style={{
          background: "rgba(17,17,9,0.86)",
          border: "1px solid rgba(201,168,76,0.16)",
          color: "var(--color-text)",
          backdropFilter: "blur(14px)",
        }}
      >
        <span className="sr-only">{open ? labels.menuClose : labels.menuOpen}</span>
        <div className="relative h-4 w-5">
          <motion.span
            className="absolute left-0 top-0 block h-px w-5 origin-center"
            animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.28 }}
            style={{ background: "currentColor" }}
          />
          <motion.span
            className="absolute left-0 top-[7px] block h-px w-5"
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{ background: "currentColor" }}
          />
          <motion.span
            className="absolute left-0 top-[14px] block h-px w-5 origin-center"
            animate={open ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
            transition={{ duration: 0.28 }}
            style={{ background: "currentColor" }}
          />
        </div>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <motion.div
            id="mobile-nav-menu"
            className="absolute left-0 right-0 top-full md:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background:
                "linear-gradient(180deg, rgba(10,10,8,0.98) 0%, rgba(18,18,13,0.98) 100%)",
              backdropFilter: "blur(20px)",
              borderBottom: "1px solid rgba(201,168,76,0.14)",
              boxShadow: "0 26px 56px rgba(0,0,0,0.36)",
            }}
          >
            <nav className="container-xl flex flex-col gap-2 py-4">
              {navLinks.map(({ href, label }, index) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.24,
                    delay: index * 0.04,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between rounded-[22px] px-4 py-4 text-sm uppercase tracking-[0.24em] transition-colors duration-200"
                    style={{
                      color: "var(--color-text-secondary)",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(201,168,76,0.1)",
                    }}
                  >
                    <span>{label}</span>
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ background: "rgba(184,138,84,0.5)" }}
                    />
                  </Link>
                </motion.div>
              ))}
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
