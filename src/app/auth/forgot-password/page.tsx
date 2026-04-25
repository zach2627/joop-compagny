"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { DEFAULT_LOCALE, getPathLocale, localizedPath } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/translations";

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
            {dict.forgotTitle}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6e6e73" }}>
            {dict.forgotSubtitle}
          </p>
        </div>

        <div
          className="rounded-apple-xl p-8"
          style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.2)" }}
        >
          {status === "success" ? (
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
              <p className="font-semibold text-white mb-2">{dict.emailSent}</p>
              <p className="text-sm leading-relaxed" style={{ color: "#6e6e73" }}>
                {dict.forgotSuccessPrefix} <span style={{ color: "#d2d2d7" }}>{email}</span>,{" "}
                {dict.forgotSuccessSuffix}
              </p>
              <p className="text-xs mt-3" style={{ color: "#3a3a3f" }}>
                {dict.checkSpam}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: "#d2d2d7" }}
                  htmlFor="email"
                >
                  {dict.email}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-apple-md text-sm transition-all duration-200"
                  style={{ background: "#242424", border: "1px solid #2E2E2E", color: "#FFFFFF" }}
                  placeholder="vous@exemple.sn"
                  autoComplete="email"
                  required
                  disabled={status === "loading"}
                />
              </div>

              {status === "error" && error && (
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
                {status === "loading" ? dict.sending : dict.sendResetLink}
              </button>
            </form>
          )}

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
