"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DEFAULT_LOCALE, getPathLocale, localizedPath } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/translations";

const authShellStyle = {
  background:
    "radial-gradient(circle at top right, rgba(201,168,76,0.14), transparent 24%), linear-gradient(180deg, #0a0a08 0%, #15150f 100%)",
};
const authPanelStyle = {
  background: "rgba(17,17,9,0.84)",
  border: "1px solid rgba(201,168,76,0.16)",
  boxShadow: "0 28px 64px rgba(0,0,0,0.36)",
  backdropFilter: "blur(18px)",
};
const authInputStyle = {
  background: "rgba(17,17,9,0.92)",
  border: "1px solid rgba(201,168,76,0.14)",
  color: "var(--color-text)",
};

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
      <div className="space-y-3 py-4 text-center">
        <p className="text-sm" style={{ color: "var(--color-text)" }}>{dict.invalidLink}</p>
        <Link
          href={localizedPath("/auth/forgot-password", locale)}
          className="text-sm font-medium hover:underline"
          style={{ color: "var(--color-primary-dark)" }}
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
      <div className="py-4 text-center">
        <div
          className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full"
          style={{
            background: "rgba(184,138,84,0.08)",
            border: "1px solid rgba(184,138,84,0.16)",
          }}
        >
          <svg
            className="h-7 w-7"
            fill="none"
            stroke="var(--color-primary-dark)"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <p className="mb-2 font-semibold" style={{ color: "var(--color-text)" }}>
          {dict.passwordUpdated}
        </p>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          {dict.redirectingLogin}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          className="mb-1.5 block text-sm font-medium"
          style={{ color: "var(--color-text-secondary)" }}
          htmlFor="password"
        >
          {dict.newPassword}
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-apple-md px-4 py-3 text-sm transition-all duration-200"
          style={authInputStyle}
          placeholder="********"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={status === "loading"}
        />
        <p className="mt-1.5 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
          {dict.minPassword}
        </p>
      </div>

      <div>
        <label
          className="mb-1.5 block text-sm font-medium"
          style={{ color: "var(--color-text-secondary)" }}
          htmlFor="confirmPassword"
        >
          {dict.confirmPassword}
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full rounded-apple-md px-4 py-3 text-sm transition-all duration-200"
          style={authInputStyle}
          placeholder="********"
          autoComplete="new-password"
          required
          minLength={8}
          disabled={status === "loading"}
        />
      </div>

      {error && (
        <div
          className="rounded-apple-md px-4 py-3 text-sm"
          style={{
            background: "rgba(184,138,84,0.08)",
            border: "1px solid rgba(184,138,84,0.16)",
            color: "var(--color-text)",
          }}
        >
          {error}
        </div>
      )}

      <button type="submit" disabled={status === "loading"} className="btn-primary w-full py-3.5">
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
    <div className="flex min-h-screen items-center justify-center p-4" style={authShellStyle}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href={localizedPath("/", locale)} className="mb-4 inline-block">
            <Image src="/icon.svg" alt="JOOP COMPAGNY" width={48} height={48} />
          </Link>
          <h1
            style={{
              color: "var(--color-text)",
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "2.4rem",
              lineHeight: 0.98,
            }}
          >
            {dict.resetTitle}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {dict.resetSubtitle}
          </p>
        </div>

        <div className="rounded-apple-xl p-8" style={authPanelStyle}>
          <Suspense
            fallback={
              <div
                className="h-48 animate-pulse rounded-apple-md"
                style={{ background: "rgba(220,193,188,0.24)" }}
              />
            }
          >
            <ResetPasswordForm />
          </Suspense>

          <div className="mt-6 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
            <Link
              href={localizedPath("/auth/login", locale)}
              className="font-medium hover:underline"
              style={{ color: "var(--color-primary-dark)" }}
            >
              {dict.backToLogin}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
