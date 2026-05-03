// src/config/site.ts

const DEFAULT_PUBLIC_PHONE = "+221 77 000 00 00";
const rawPublicPhone =
  process.env.NEXT_PUBLIC_CONTACT_PHONE?.trim() || DEFAULT_PUBLIC_PHONE;
const normalizedPublicPhone = rawPublicPhone.replace(/\s+/g, "");
const normalizedPublicPhoneDigits = normalizedPublicPhone.replace(/\D/g, "");
const normalizedWhatsAppNumber = (
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.trim() || ""
).replace(/\D/g, "");

export const hasPublicPhone =
  Boolean(normalizedPublicPhoneDigits) &&
  normalizedPublicPhoneDigits !== "221770000000";

export const publicPhoneHref = hasPublicPhone
  ? `tel:${normalizedPublicPhone}`
  : null;

export const hasWhatsApp = Boolean(normalizedWhatsAppNumber);

export const whatsAppUrl = hasWhatsApp
  ? `https://wa.me/${normalizedWhatsAppNumber}`
  : null;

export const siteConfig = {
  name: "JOOP COMPANY",
  shortName: "JOOP",
  description:
    "Maison senegalaise de bijoux, parfums et encens avec une direction artistique luxe et coloree.",
  tagline: "Bijoux, parfums et encens au coeur de Dakar",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://joop-compagny.com",
  email: "contact@joop-compagny.com",
  phone: rawPublicPhone,
  address: "Dakar, Senegal",
  currency: "XOF",
  navCategories: ["bijoux", "montres", "parfums", "encens", "coffrets"] as const,
};
