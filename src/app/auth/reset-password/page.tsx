"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_LOCALE, getPathLocale, localizedPath } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/translations";

function ResetPasswordForm() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getPathLocale(pathname) ?? DEFAULT_LOCALE;
  const dict = dictionaries[locale].auth;
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  if (!token) {
    return (
      <div className="text-center py-4 space-y-3">
        <p className="text-sm" style={{ color: "#F87171" }}>
          {dict.invalidLink}
        </p>
        <Link
          href={localizedPath("/auth/forgot-password", locale)}
          className="text-sm font-medium hover:underline"
          style={{ color: "#C9A84C" }}
        >
          {dict.requestNewLink}
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError(dict.passwordMismatch);
      return;
    }
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setTimeout(() => router.push(localizedPath("/auth/login", locale)), 2500);
      } else {
        setError(data.error ?? dict.genericError);
        setStatus("error");
      }
    } catch {
      setError(dict.serverError);
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-4">
        <div
          className="w-14 h-14 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: "rgba(201,168,76,0.1)",
            border: "1px solid rgba(201,168,76,0.3)",
          }}
        >
          <svg className="w-7 h-7" fill="none" stroke="#C9A84C" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="font-semibold text-white mb-2">{dict.passwordUpdated}</p>
        <p className="text-sm" style={{ color: "#6e6e73" }}>
          {dict.redirectingLogin}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: "#d2d2d7" }}
          htmlFor="password"
        >
          {dict.newPassword}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-apple-md text-sm transition-all duration-200"
          style={{ background: "#242424", border: "1px solid #2E2E2E", color: "#FFFFFF" }}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={status === "loading"}
        />
        <p className="text-xs mt-1.5" style={{ color: "#3a3a3f" }}>
          {dict.minPassword}
        </p>
      </div>

      <div>
        <label
          className="block text-sm font-medium mb-1.5"
          style={{ color: "#d2d2d7" }}
          htmlFor="confirmPassword"
        >
          {dict.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-apple-md text-sm transition-all duration-200"
          style={{ background: "#242424", border: "1px solid #2E2E2E", color: "#FFFFFF" }}
          placeholder="••••••••"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={status === "loading"}
        />
      </div>

      {error && (
        <div
          className="px-4 py-3 rounded-apple-md text-sm"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#F87171",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="btn-primary w-full py-3.5"
      >
        {status === "loading" ? dict.updating : dict.resetPassword}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const pathname = usePathname();
  const locale = getPathLocale(pathname) ?? DEFAULT_LOCALE;
  const dict = dictionaries[locale].auth;

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)" }}
    >
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href={localizedPath("/", locale)} className="inline-block mb-4">
            <Image
              src="/icon.svg"
              alt="JOOP COMPAGNY"
              width={48}
              height={48}
              style={{ objectFit: "contain" }}
            />
          </Link>
          <h1 className="text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
            {dict.resetTitle}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6e6e73" }}>
            {dict.resetSubtitle}
          </p>
        </div>

        <div
          className="rounded-apple-xl p-8"
          style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          <Suspense
            fallback={
              <div
                className="h-48 animate-pulse rounded-apple-md"
                style={{ background: "#242424" }}
              />
            }
          >
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 text-center text-sm" style={{ color: "#6e6e73" }}>
            <Link
              href={localizedPath("/auth/login", locale)}
              className="font-medium hover:underline"
              style={{ color: "#C9A84C" }}
            >
              {dict.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
