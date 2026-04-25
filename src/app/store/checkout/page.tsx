// src/app/store/checkout/page.tsx
import { redirect } from "next/navigation";
import { getCartData } from "@/features/cart/actions";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import type { Metadata } from "next";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  return { title: dict.checkout.title };
}

export default async function CheckoutPage() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const { subtotal, taxAmount, total, itemCount } = await getCartData();

  if (itemCount === 0) {
    redirect(localizedPath("/store/cart", locale));
  }

  return (
    <CheckoutClient
      cart={{ subtotal, taxAmount, total, itemCount }}
      locale={locale}
      labels={{
        eyebrow: dict.checkout.eyebrow,
        heading: dict.checkout.heading,
        addressTitle: dict.checkout.addressTitle,
        firstName: dict.checkout.firstName,
        lastName: dict.checkout.lastName,
        phone: dict.checkout.phone,
        email: dict.checkout.email,
        street: dict.checkout.street,
        city: dict.checkout.city,
        region: dict.checkout.region,
        select: dict.checkout.select,
        receiptPlaceholder: dict.checkout.receiptPlaceholder,
        streetPlaceholder: dict.checkout.streetPlaceholder,
        cityPlaceholder: dict.checkout.cityPlaceholder,
        paymentTitle: dict.checkout.paymentTitle,
        waveDesc: dict.checkout.waveDesc,
        orangeDesc: dict.checkout.orangeDesc,
        cashLabel: dict.checkout.cashLabel,
        cashDesc: dict.checkout.cashDesc,
        paymentPhone:
          locale === "en" ? "{method} number *" : "Numéro {method} *",
        notes: dict.checkout.notes,
        notesPlaceholder: dict.checkout.notesPlaceholder,
        summary: dict.checkout.summary,
        itemSingular: locale === "en" ? "item" : "article",
        itemPlural: locale === "en" ? "items" : "articles",
        delivery: dict.checkout.delivery,
        free: dict.checkout.free,
        total: dict.checkout.total,
        processing: dict.checkout.processing,
        confirm: dict.checkout.confirm,
        payWith: locale === "en" ? "Pay with" : "Payer avec",
        freeDakar: dict.checkout.freeDakar,
        secure: dict.checkout.secure,
      }}
    />
  );
}
