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
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: "#0A0A08" }}
    >
      <div className="w-full max-w-md text-center">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "rgba(201,168,76,0.08)",
            border: "1px solid rgba(201,168,76,0.2)",
          }}
        >
          <svg className="h-8 w-8" fill="none" stroke="#C9A84C" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>

        <h1 className="mb-2 text-2xl font-bold text-white">Une erreur est survenue</h1>
        <p className="mb-8 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
          Quelque chose s&apos;est mal passe. Notre equipe a ete notifiee.
        </p>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200 hover:scale-105"
            style={{ background: "#C9A84C", color: "#0A0A08" }}
          >
            Reessayer
          </button>
          <Link
            href="/"
            className="rounded-full px-6 py-3 text-sm font-semibold transition-all duration-200"
            style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.35)" }}
          >
            Retour a l&apos;accueil
          </Link>
        </div>

        {error.digest ? (
          <p className="mt-6 font-mono text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
            Reference : {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
