// src/app/auth/login/page.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useTransition, useState, Suspense } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/features/auth/actions";
import { mergeGuestCartAction } from "@/features/cart/actions";
import { siteConfig } from "@/config/site";
import { DEFAULT_LOCALE, getPathLocale, localizedPath } from "@/lib/i18n/config";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { dictionaries } from "@/lib/i18n/translations";

function LoginForm() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = getPathLocale(pathname) ?? DEFAULT_LOCALE;
  const dict = dictionaries[locale].auth;
  const searchParams = useSearchParams();
  const redirect = sanitizeRedirectPath(
    searchParams.get("redirect"),
    localizedPath("/", locale)
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    if (result.success) {
      await mergeGuestCartAction();
      startTransition(() => {
        if (result.data.role === "ADMIN" || result.data.role === "STAFF") {
          router.push(localizedPath("/admin", locale));
        } else {
          router.push(redirect);
        }
      });
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1.5" style={{ color: "#d2d2d7" }} htmlFor="email">{dict.email}</label>
        <input id="email" name="email" type="email"
          className="w-full px-4 py-3 rounded-apple-md text-sm transition-all duration-200"
          style={{ background: "#242424", border: "1px solid #2E2E2E", color: "#FFFFFF" }}
          placeholder="vous@exemple.sn" autoComplete="email" required disabled={isPending} />
      </div>
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-sm font-medium" style={{ color: "#d2d2d7" }} htmlFor="password">{dict.password}</label>
          <Link
            href={localizedPath("/auth/forgot-password", locale)}
            className="text-xs hover:underline"
            style={{ color: "#C9A84C" }}
          >
            {dict.forgotPassword}
          </Link>
        </div>
        <input id="password" name="password" type="password"
          className="w-full px-4 py-3 rounded-apple-md text-sm transition-all duration-200"
          style={{ background: "#242424", border: "1px solid #2E2E2E", color: "#FFFFFF" }}
          placeholder="••••••••" autoComplete="current-password" required disabled={isPending} />
      </div>
      {error && (
        <div className="px-4 py-3 rounded-apple-md text-sm"
          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#F87171" }}
          role="alert" aria-live="polite">
          {error}
        </div>
      )}
      <button type="submit" disabled={isPending} className="btn-primary w-full py-3.5">
        {isPending ? dict.signingIn : dict.signIn}
      </button>
    </form>
  );
}

export default function LoginPage() {
  const pathname = usePathname();
  const locale = getPathLocale(pathname) ?? DEFAULT_LOCALE;
  const dict = dictionaries[locale].auth;

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)" }}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href={localizedPath("/", locale)} className="inline-block mb-4">
            <Image
              src="/icon.svg"
              alt={siteConfig.name}
              width={48}
              height={48}
              style={{ objectFit: "contain" }}
            />
          </Link>
          <h1 className="text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
            {dict.loginTitle(siteConfig.name)}
          </h1>
          <p className="text-sm mt-1" style={{ color: "#6e6e73" }}>
            {dict.loginSubtitle}
          </p>
        </div>

        <div className="rounded-apple-xl p-8"
          style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.2)" }}>
          <Suspense fallback={<div className="h-48 animate-pulse rounded-apple-md" style={{ background: "#242424" }} />}>
            <LoginForm />
          </Suspense>
          <div className="mt-6 text-center text-sm" style={{ color: "#6e6e73" }}>
            {dict.noAccount}{" "}
            <Link href={localizedPath("/auth/register", locale)} className="font-medium hover:underline" style={{ color: "#C9A84C" }}>
              {dict.createAccount}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
