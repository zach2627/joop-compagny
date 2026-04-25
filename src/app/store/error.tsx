"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function StoreError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[StoreError]", error);
  }, [error]);

  return (
    <div
      className="min-h-[60vh] flex items-center justify-center p-4"
      style={{ background: "#080808" }}
    >
      <div className="w-full max-w-md text-center">
        <div
          className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)" }}
        >
          <svg className="w-7 h-7" fill="none" stroke="#F87171" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
        </div>

        <h2 className="text-xl font-bold text-white mb-2">Erreur dans la boutique</h2>
        <p className="text-sm mb-7" style={{ color: "#6e6e73" }}>
          Impossible de charger cette page. Veuillez réessayer.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: "linear-gradient(135deg, #C9A84C, #E8C97A)", color: "#000" }}
          >
            Réessayer
          </button>
          <Link
            href="/store/products"
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
          >
            Voir les produits
          </Link>
        </div>
      </div>
    </div>
  );
}
