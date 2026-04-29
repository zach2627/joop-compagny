"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
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

export default function ForgotPasswordPage() {
  const pathname = usePathname();
  const locale = getPathLocale(pathname) ?? DEFAULT_LOCALE;
  const dict = dictionaries[locale].auth;
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
      } else {
        const data = await res.json();
        setError(data.error ?? dict.genericError);
        setStatus("error");
      }
    } catch {
      setError(dict.serverError);
      setStatus("error");
    }
  };

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
            {dict.forgotTitle}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {dict.forgotSubtitle}
          </p>
        </div>

        <div className="rounded-apple-xl p-8" style={authPanelStyle}>
          {status === "success" ? (
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
                {dict.emailSent}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                {dict.forgotSuccessPrefix} <span style={{ color: "var(--color-text)" }}>{email}</span>,{" "}
                {dict.forgotSuccessSuffix}
              </p>
              <p className="mt-3 text-xs" style={{ color: "var(--color-text-tertiary)" }}>
                {dict.checkSpam}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="mb-1.5 block text-sm font-medium"
                  style={{ color: "var(--color-text-secondary)" }}
                  htmlFor="email"
                >
                  {dict.email}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-apple-md px-4 py-3 text-sm transition-all duration-200"
                  style={authInputStyle}
                  placeholder="vous@exemple.sn"
                  autoComplete="email"
                  required
                  disabled={status === "loading"}
                />
              </div>

              {status === "error" && error && (
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

              <button
                type="submit"
                disabled={status === "loading"}
                className="btn-primary w-full py-3.5"
              >
                {status === "loading" ? dict.sending : dict.sendResetLink}
              </button>
            </form>
          )}

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
