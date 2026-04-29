"use client";

import Link from "next/link";
import { useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "framer-motion";
import { siteConfig } from "@/config/site";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { MobileNav } from "./MobileNav";
import { NavActions } from "./NavActions";
import { NavSearch } from "./NavSearch";

interface StoreNavbarClientProps {
  locale: Locale;
  ariaLabel: string;
  navLinks: { href: string; label: string }[];
  labels: {
    home: string;
    search: string;
    account: string;
    admin: string;
    login: string;
    menuOpen: string;
    menuClose: string;
  };
}

export function StoreNavbarClient({
  locale,
  ariaLabel,
  navLinks,
  labels,
}: StoreNavbarClientProps) {
  const [scrolled, setScrolled] = useState(false);
  const prefersReducedMotion = useReducedMotion();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 18);
  });

  return (
    <motion.nav
      className="fixed left-0 right-0 z-50 h-[var(--nav-height)]"
      style={{ top: "var(--banner-height)" }}
      aria-label={ariaLabel}
      initial={false}
      animate={
        prefersReducedMotion
          ? undefined
          : scrolled
            ? {
                backgroundColor: "rgba(10,10,8,0.92)",
                borderColor: "rgba(201,168,76,0.14)",
                boxShadow: "0 16px 38px rgba(0,0,0,0.32)",
                backdropFilter: "blur(20px)",
              }
            : {
                backgroundColor: "rgba(10,10,8,0.3)",
                borderColor: "rgba(201,168,76,0.05)",
                boxShadow: "0 0 0 rgba(0,0,0,0)",
                backdropFilter: "blur(14px)",
              }
      }
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="container-xl flex h-full items-center gap-4">
        <Link
          href={localizedPath("/", locale)}
          className="flex shrink-0 flex-col justify-center leading-none"
          aria-label={labels.home}
        >
          <span
            className="text-[1.1rem] uppercase"
            style={{
              color: "var(--color-primary-dark)",
              letterSpacing: "0.34em",
              fontFamily: 'var(--font-cormorant), "Cormorant Garamond", Georgia, serif',
            }}
          >
            JOOP
          </span>
          <span
            className="mt-1 text-[0.78rem] uppercase"
            style={{
              color: "rgba(255,255,255,0.56)",
              letterSpacing: "0.28em",
            }}
          >
            Maison sensorielle
          </span>
        </Link>

        <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-full px-4 py-2 text-[11px] uppercase tracking-[0.28em] transition-all duration-300"
              style={{
                color: "var(--color-text-secondary)",
              }}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className="h-1.5 w-1.5 rounded-full"
              style={{ background: "rgba(184,138,84,0.3)" }}
                />
                {label}
              </span>
            </Link>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-1.5">
          <div className="hidden lg:block">
            <p
              className="text-[10px] uppercase tracking-[0.28em]"
              style={{ color: "rgba(255,255,255,0.48)" }}
            >
              {siteConfig.address}
            </p>
          </div>
          <NavSearch
            label={labels.search}
            href={localizedPath("/store/products", locale)}
          />
          <NavActions
            locale={locale}
            labels={{
              account: labels.account,
              admin: labels.admin,
              login: labels.login,
            }}
          />
          <MobileNav
            navLinks={navLinks}
            labels={{
              menuOpen: labels.menuOpen,
              menuClose: labels.menuClose,
            }}
          />
        </div>
      </div>
    </motion.nav>
  );
}
