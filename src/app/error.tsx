"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)" }}
    >
      <div className="w-full max-w-md text-center">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)" }}
        >
          <svg className="w-8 h-8" fill="none" stroke="#F87171" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">Une erreur est survenue</h1>
        <p className="text-sm mb-8" style={{ color: "#6e6e73" }}>
          Quelque chose s&apos;est mal passé. Notre équipe a été notifiée.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)", color: "#000" }}
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-full text-sm font-semibold transition-all duration-200"
            style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.35)" }}
          >
            Retour à l&apos;accueil
          </Link>
        </div>

        {error.digest && (
          <p className="text-xs mt-6 font-mono" style={{ color: "#3a3a3f" }}>
            Référence : {error.digest}
          </p>
        )}
      </div>
    </div>
  );
}
