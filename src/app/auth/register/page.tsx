// src/app/auth/register/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransition, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { registerAction } from "@/features/auth/actions";
import { DEFAULT_LOCALE, getPathLocale, localizedPath } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/translations";

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

  const inputStyle = { background: "#242424", border: "1px solid #2E2E2E", color: "#FFFFFF" };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)" }}>
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
          <h1 className="text-2xl font-semibold" style={{ color: "#FFFFFF" }}>{dict.registerTitle}</h1>
          <p className="text-sm mt-1" style={{ color: "#6e6e73" }}>{dict.registerSubtitle}</p>
        </div>

        <div className="rounded-apple-xl p-8"
          style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.2)" }}>
          <form onSubmit={handleSubmit} className="space-y-4" aria-label={dict.registerFormAria}>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#d2d2d7" }} htmlFor="name">
                {dict.fullName}
              </label>
              <input
                id="name" name="name" type="text"
                className="w-full px-4 py-3 rounded-apple-md text-sm"
                style={inputStyle}
                placeholder={dict.namePlaceholder}
                autoComplete="name"
                required
                disabled={isPending}
                aria-required="true"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#d2d2d7" }} htmlFor="email">
                Email
              </label>
              <input
                id="email" name="email" type="email"
                className="w-full px-4 py-3 rounded-apple-md text-sm"
                style={inputStyle}
                placeholder="vous@exemple.sn"
                autoComplete="email"
                required
                disabled={isPending}
                aria-required="true"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#d2d2d7" }} htmlFor="password">
                {dict.password}
              </label>
              <input
                id="password" name="password" type="password"
                className="w-full px-4 py-3 rounded-apple-md text-sm"
                style={inputStyle}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending}
                aria-required="true"
                aria-describedby="password-hint"
              />
              <p id="password-hint" className="text-xs mt-1" style={{ color: "#3a3a3f" }}>
                {dict.passwordHint}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: "#d2d2d7" }} htmlFor="confirmPassword">
                {dict.confirmPassword}
              </label>
              <input
                id="confirmPassword" name="confirmPassword" type="password"
                className="w-full px-4 py-3 rounded-apple-md text-sm"
                style={inputStyle}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                minLength={8}
                disabled={isPending}
                aria-required="true"
              />
            </div>

            {error && (
              <div
                className="px-4 py-3 rounded-apple-md text-sm"
                style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#F87171" }}
                role="alert"
                aria-live="polite"
              >
                {error}
              </div>
            )}

            <button type="submit" disabled={isPending} className="btn-primary w-full py-3.5">
              {isPending ? dict.creating : dict.createAccount}
            </button>
          </form>

          <div className="mt-6 text-center text-sm" style={{ color: "#6e6e73" }}>
            {dict.alreadyAccount}{" "}
            <Link href={localizedPath("/auth/login", locale)} className="font-medium hover:underline" style={{ color: "#C9A84C" }}>
              {dict.signIn}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
