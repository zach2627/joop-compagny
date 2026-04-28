"use client";

import { useState } from "react";
import Link from "next/link";

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
      <button
        className="md:hidden flex flex-col items-center justify-center gap-1.5 w-9 h-9 rounded-lg"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? labels.menuClose : labels.menuOpen}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
      >
        <span
          className={`block h-0.5 w-5 bg-white transition-transform duration-300 origin-center ${
            open ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-white transition-opacity duration-200 ${
            open ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-5 bg-white transition-transform duration-300 origin-center ${
            open ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      <div
        id="mobile-nav-menu"
        className={`absolute top-full left-0 right-0 md:hidden transition-all duration-300 overflow-hidden ${
          open ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
        style={{
          background: "rgba(10,10,8,0.98)",
          backdropFilter: "blur(20px)",
          borderBottom: open ? "1px solid rgba(201,168,76,0.15)" : "none",
        }}
      >
        <nav className="container-xl py-2 flex flex-col">
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="py-4 text-sm font-medium transition-colors duration-200 hover:text-[#C9A84C]"
              style={{
                color: "rgba(255,255,255,0.6)",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </>
  );
}
