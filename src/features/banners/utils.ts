export const DEFAULT_BANNER_CTA_HREF = "/store/products";

export function normalizeBannerCtaHref(href?: string | null): string {
  const value = href?.trim();

  if (!value || value === "/products") {
    return DEFAULT_BANNER_CTA_HREF;
  }

  return value;
}
