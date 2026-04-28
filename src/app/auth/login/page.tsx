// src/app/auth/login/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { Suspense, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { loginAction } from "@/features/auth/actions";
import { mergeGuestCartAction } from "@/features/cart/actions";
import { siteConfig } from "@/config/site";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import { DEFAULT_LOCALE, getPathLocale, localizedPath } from "@/lib/i18n/config";
import { dictionaries } from "@/lib/i18n/translations";

const authShellStyle = { background: "#0A0A08" };
const authPanelStyle = {
  background: "#111109",
  border: "1px solid rgba(201,168,76,0.2)",
};
const authInputStyle = {
  background: "#111109",
  border: "1px solid rgba(255,255,255,0.08)",
  color: "#FFFFFF",
};

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
        <label
          className="mb-1.5 block text-sm font-medium"
          style={{ color: "rgba(255,255,255,0.6)" }}
          htmlFor="email"
        >
          {dict.email}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          className="w-full rounded-apple-md px-4 py-3 text-sm transition-all duration-200"
          style={authInputStyle}
          placeholder="vous@exemple.sn"
          autoComplete="email"
          required
          disabled={isPending}
        />
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label
            className="text-sm font-medium"
            style={{ color: "rgba(255,255,255,0.6)" }}
            htmlFor="password"
          >
            {dict.password}
          </label>
          <Link
            href={localizedPath("/auth/forgot-password", locale)}
            className="text-xs hover:underline"
            style={{ color: "#C9A84C" }}
          >
            {dict.forgotPassword}
          </Link>
        </div>
        <input
          id="password"
          name="password"
          type="password"
          className="w-full rounded-apple-md px-4 py-3 text-sm transition-all duration-200"
          style={authInputStyle}
          placeholder="********"
          autoComplete="current-password"
          required
          disabled={isPending}
        />
      </div>

      {error && (
        <div
          className="rounded-apple-md px-4 py-3 text-sm"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(201,168,76,0.2)",
            color: "#FFFFFF",
          }}
          role="alert"
          aria-live="polite"
        >
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
    <div className="flex min-h-screen items-center justify-center p-4" style={authShellStyle}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href={localizedPath("/", locale)} className="mb-4 inline-block">
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
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            {dict.loginSubtitle}
          </p>
        </div>

        <div className="rounded-apple-xl p-8" style={authPanelStyle}>
          <Suspense
            fallback={
              <div className="h-48 animate-pulse rounded-apple-md" style={{ background: "#1A1A14" }} />
            }
          >
            <LoginForm />
          </Suspense>

          <div className="mt-6 text-center text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
            {dict.noAccount}{" "}
            <Link
              href={localizedPath("/auth/register", locale)}
              className="font-medium hover:underline"
              style={{ color: "#C9A84C" }}
            >
              {dict.createAccount}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
