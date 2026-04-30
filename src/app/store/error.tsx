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
      className="flex min-h-[60vh] items-center justify-center p-4"
      style={{ background: "#0A0A08" }}
    >
      <div className="w-full max-w-md text-center">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: "rgba(201,168,76,0.08)",
            border: "1px solid rgba(201,168,76,0.25)",
          }}
        >
          <svg className="h-7 w-7" fill="none" stroke="#C9A84C" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h2 className="mb-2 text-xl font-bold text-white">Erreur dans la boutique</h2>
        <p className="mb-7 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          Impossible de charger cette page. Veuillez reessayer.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: "#C9A84C", color: "#0A0A08" }}
          >
            Reessayer
          </button>
          <Link
            href="/store/products"
            className="rounded-full px-5 py-2.5 text-sm font-semibold transition-all"
            style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
          >
            Voir les produits
          </Link>
        </div>
      </div>
    </div>
  );
}
