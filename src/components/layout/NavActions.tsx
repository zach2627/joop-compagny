"use client";

import { useEffect, useState } from "react";
import { localizedPath, type Locale } from "@/lib/i18n/config";
import { NavCart } from "./NavCart";
import { NavUser } from "./NavUser";

type NavSession = {
  id: string;
  name?: string | null;
  role: string;
};

type NavSummary = {
  session: NavSession | null;
  itemCount: number;
};

interface NavActionsProps {
  locale: Locale;
  labels: {
    account: string;
    admin: string;
    login: string;
  };
}

function getCartLabel(locale: Locale, itemCount: number) {
  if (locale === "en") {
    return `Cart (${itemCount} item${itemCount > 1 ? "s" : ""})`;
  }

  return `Panier (${itemCount} article${itemCount > 1 ? "s" : ""})`;
}

export function NavActions({ locale, labels }: NavActionsProps) {
  const [summary, setSummary] = useState<NavSummary>({
    session: null,
    itemCount: 0,
  });

  useEffect(() => {
    let active = true;

    fetch("/api/store/nav", {
      cache: "no-store",
      credentials: "same-origin",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data: NavSummary | null) => {
        if (!active || !data) return;
        setSummary({
          session: data.session,
          itemCount: Number(data.itemCount) || 0,
        });
      })
      .catch(() => {
        // Keep the static navbar usable if the dynamic summary fails.
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <NavUser session={summary.session} locale={locale} labels={labels} />
      <NavCart
        itemCount={summary.itemCount}
        href={localizedPath("/store/cart", locale)}
        label={getCartLabel(locale, summary.itemCount)}
      />
    </>
  );
}
