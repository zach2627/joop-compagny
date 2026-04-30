// src/app/auth/register/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { registerAction } from "@/features/auth/actions";
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

export default function RegisterPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getPathLocale(pathname) ?? DEFAULT_LOCALE;
  const dict = dictionaries[locale].auth;
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerAction(formData);
      if (result.success) {
        router.push(localizedPath("/", locale));
      } else {
        setError(result.error);
      }
    });
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
            {dict.registerTitle}
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {dict.registerSubtitle}
          </p>
        </div>

        <div className="rounded-apple-xl p-8" style={authPanelStyle}>
          <form onSubmit={handleSubmit} className="space-y-4" aria-label={dict.registerFormAria}>
            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
                htmlFor="name"
              >
                {dict.fullName}
              </label>
              <input
                id="name"
                name="name"
                type="text"
                className="w-full rounded-apple-md px-4 py-3 text-sm"
                style={authInputStyle}
                placeholder={dict.namePlaceholder}
                autoComplete="name"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                className="w-full rounded-apple-md px-4 py-3 text-sm"
                style={authInputStyle}
                placeholder="vous@exemple.sn"
                autoComplete="email"
                required
                disabled={isPending}
              />
            </div>

            <div>
              <label
                className="mb-1.5 block text-sm font-medium"
                style={{ color: "var(--color-text-secondary)" }}
                htmlFor="password"
              >
                {dict.password}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                className="w-full rounded-apple-md px-4 py-3 text-sm"
                style={authInputStyle}
                placeholder="********"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending}
                aria-describedby="password-hint"
              />
              <p
                id="password-hint"
                className="mt-1 text-xs"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {dict.passwordHint}
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
                name="confirmPassword"
                type="password"
                className="w-full rounded-apple-md px-4 py-3 text-sm"
                style={authInputStyle}
                placeholder="********"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending}
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

            <button type="submit" disabled={isPending} className="btn-primary w-full py-3.5">
              {isPending ? dict.creating : dict.createAccount}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: "var(--color-text-secondary)" }}>
            {dict.alreadyAccount}{" "}
            <Link
              href={localizedPath("/auth/login", locale)}
              className="font-medium hover:underline"
              style={{ color: "var(--color-primary-dark)" }}
            >
              {dict.signIn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
