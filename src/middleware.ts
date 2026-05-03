// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import {
  DEFAULT_LOCALE,
  getPathLocale,
  isLocale,
  localizedPath,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_HEADER,
  stripLocalePrefix,
  type Locale,
} from "@/lib/i18n/config";

const ADMIN_ROUTE_PREFIXES = ["/admin", "/api/admin"];
const CUSTOMER_PROTECTED_PREFIXES = ["/store/orders", "/store/account"];
const LOCALE_REDIRECT_EXCLUDED_PATHS = [
  "/apple-touch-icon",
  "/manifest.webmanifest",
  "/og",
  "/robots.txt",
  "/sitemap.xml",
];
const PUBLIC_FILE_PATTERN = /\.(?:gif|ico|jpg|jpeg|png|svg|txt|webmanifest|webp|xml)$/i;

export async function middleware(request: NextRequest) {
  const originalPathname = request.nextUrl.pathname;
  const pathLocale = getPathLocale(originalPathname);
  const cookieLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const preferredLocale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const locale = pathLocale ?? preferredLocale;
  const pathname = pathLocale ? stripLocalePrefix(originalPathname) : originalPathname;
  const isApiRequest = pathname.startsWith("/api/");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(LOCALE_HEADER, locale);

  const withBaseHeaders = (response: NextResponse) => {
    // Keep a minimal set of security headers close to the edge.
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );

    if (process.env.NODE_ENV === "production") {
      response.headers.set(
        "Strict-Transport-Security",
        "max-age=63072000; includeSubDomains; preload"
      );
    }

    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  };

  const continueResponse = () => {
    if (pathLocale) {
      const rewriteUrl = request.nextUrl.clone();
      rewriteUrl.pathname = pathname;
      return withBaseHeaders(
        NextResponse.rewrite(rewriteUrl, {
          request: { headers: requestHeaders },
        })
      );
    }

    return withBaseHeaders(
      NextResponse.next({
        request: { headers: requestHeaders },
      })
    );
  };

  const localizedRedirectPath = () =>
    localizedPath(`${pathname}${request.nextUrl.search}`, locale);

  const redirectTo = (targetPath: string, targetLocale: Locale = locale) =>
    withBaseHeaders(
      NextResponse.redirect(
        new URL(localizedPath(targetPath, targetLocale), request.url)
      )
    );

  const redirectToLogin = () =>
    redirectTo(
      `/auth/login?redirect=${encodeURIComponent(localizedRedirectPath())}`
    );

  const unauthorized = (status: 401 | 403, error: string) =>
    withBaseHeaders(NextResponse.json({ error }, { status }));

  const response = continueResponse();
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");

  if (pathname.startsWith("/api/")) {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0] ||
      request.headers.get("x-real-ip") ||
      "unknown";

    void ip;
    // Full implementation remains in src/lib/middleware/logger.ts
  }

  const token = request.cookies.get("st_session")?.value;
  const requiresAdmin = ADMIN_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  const requiresCustomerSession = CUSTOMER_PROTECTED_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  const hasPublicOrderConfirmation =
    pathname === "/store/orders" &&
    (request.nextUrl.searchParams.has("order") ||
      request.nextUrl.searchParams.has("new"));
  const shouldSkipLocaleRedirect =
    LOCALE_REDIRECT_EXCLUDED_PATHS.includes(pathname) ||
    PUBLIC_FILE_PATTERN.test(pathname);

  if (
    !pathLocale &&
    locale !== DEFAULT_LOCALE &&
    !isApiRequest &&
    !requiresAdmin &&
    !shouldSkipLocaleRedirect
  ) {
    return redirectTo(`${pathname}${request.nextUrl.search}`, locale);
  }

  if (requiresAdmin) {
    if (!token) {
      if (isApiRequest) {
        return unauthorized(401, "Authentification requise");
      }

      return redirectToLogin();
    }

    try {
      const payload = await verifyAccessToken(token);
      if (!["ADMIN", "STAFF"].includes(payload.role)) {
        if (isApiRequest) {
          return unauthorized(403, "Accès refusé");
        }

        return redirectTo("/", locale);
      }
    } catch {
      if (isApiRequest) {
        return unauthorized(401, "Session invalide");
      }

      return redirectToLogin();
    }
  }

  if (requiresCustomerSession && !hasPublicOrderConfirmation) {
    if (!token) {
      return redirectToLogin();
    }

    try {
      await verifyAccessToken(token);
    } catch {
      return redirectToLogin();
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|fonts).*)",
  ],
};
