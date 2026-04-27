const FALLBACK_ORIGIN = "http://localhost";

export function sanitizeRedirectPath(
  value: string | null | undefined,
  fallback = "/"
): string {
  if (!value) {
    return fallback;
  }

  const trimmed = value.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) {
    return fallback;
  }

  try {
    const url = new URL(trimmed, FALLBACK_ORIGIN);
    if (url.origin !== FALLBACK_ORIGIN) {
      return fallback;
    }

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
