// src/components/checkout/CheckoutClient.tsx
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrderAction } from "@/features/orders/actions";
import { formatXOF } from "@/features/payment/paydunya";
import { localizedPath, type Locale } from "@/lib/i18n/config";

const SENEGAL_REGIONS = [
  "Dakar", "Thiès", "Diourbel", "Fatick", "Kaolack",
  "Kolda", "Louga", "Matam", "Saint-Louis", "Sédhiou",
  "Tambacounda", "Ziguinchor", "Kaffrine", "Kédougou",
];

interface CartSummary {
  subtotal: number;
  taxAmount: number;
  total: number;
  itemCount: number;
}

interface CheckoutClientProps {
  cart: CartSummary;
  locale: Locale;
  labels: {
    eyebrow: string;
    heading: string;
    addressTitle: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    street: string;
    city: string;
    region: string;
    select: string;
    receiptPlaceholder: string;
    streetPlaceholder: string;
    cityPlaceholder: string;
    paymentTitle: string;
    waveDesc: string;
    orangeDesc: string;
    cashLabel: string;
    cashDesc: string;
    paymentPhone: string;
    notes: string;
    notesPlaceholder: string;
    summary: string;
    itemSingular: string;
    itemPlural: string;
    delivery: string;
    free: string;
    total: string;
    processing: string;
    confirm: string;
    payWith: string;
    freeDakar: string;
    secure: string;
  };
}

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "10px",
  border: "1px solid rgba(201,168,76,0.2)",
  background: "#111",
  color: "#fff",
  fontSize: "14px",
  outline: "none",
} as React.CSSProperties;

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "#86868b",
  marginBottom: "6px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

export function CheckoutClient({ cart, locale, labels }: CheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("WAVE");
  const paymentMethods = [
    { value: "WAVE", label: "Wave", description: labels.waveDesc, icon: "🌊" },
    { value: "ORANGE_MONEY", label: "Orange Money", description: labels.orangeDesc, icon: "🟠" },
    { value: "CASH_ON_DELIVERY", label: labels.cashLabel, description: labels.cashDesc, icon: "🤝" },
  ];

  const needsPhone = paymentMethod === "WAVE" || paymentMethod === "ORANGE_MONEY";
  const itemCountLabel = `${cart.itemCount} ${
    cart.itemCount > 1 ? labels.itemPlural : labels.itemSingular
  }`;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);

    startTransition(async () => {
      const result = await createOrderAction(formData);
      if (result.success) {
        if (result.data.paymentUrl) {
          window.location.href = result.data.paymentUrl;
        } else {
          router.push(localizedPath(result.data.redirectPath, locale));
        }
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>
      <div className="container-lg py-12">

        <div className="mb-10">
          <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: "#C9A84C" }}>
            {labels.eyebrow}
          </p>
          <h1 className="font-black text-white" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em" }}>
            {labels.heading}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={isPending} style={{ border: "none", padding: 0, margin: 0 }}>
          <div className="grid lg:grid-cols-[1fr_360px] gap-8">

            {/* LEFT — Formulaire */}
            <div className="space-y-6">

              {/* Adresse */}
              <div className="rounded-2xl p-6" style={{ background: "#111", border: "1px solid rgba(201,168,76,0.15)" }}>
                <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                  <span style={{ color: "#C9A84C" }}>01</span> {labels.addressTitle}
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label style={labelStyle}>{labels.firstName}</label>
                    <input name="address.firstName" style={inputStyle} required placeholder={labels.firstName.replace(" *", "")} />
                  </div>
                  <div>
                    <label style={labelStyle}>{labels.lastName}</label>
                    <input name="address.lastName" style={inputStyle} required placeholder={labels.lastName.replace(" *", "")} />
                  </div>
                  <div>
                    <label style={labelStyle}>{labels.phone}</label>
                    <input name="address.phone" type="tel" style={inputStyle} required placeholder="+221 77 XXX XXXX" />
                  </div>
                  <div>
                    <label style={labelStyle}>{labels.email}</label>
                    <input name="address.email" type="email" style={inputStyle} placeholder={labels.receiptPlaceholder} />
                  </div>
                  <div className="sm:col-span-2">
                    <label style={labelStyle}>{labels.street}</label>
                    <input name="address.streetLine1" style={inputStyle} required placeholder={labels.streetPlaceholder} />
                  </div>
                  <div>
                    <label style={labelStyle}>{labels.city}</label>
                    <input name="address.city" style={inputStyle} required placeholder={labels.cityPlaceholder} />
                  </div>
                  <div>
                    <label style={labelStyle}>{labels.region}</label>
                    <select name="address.region" style={{ ...inputStyle, cursor: "pointer" }} required defaultValue="">
                      <option value="" disabled>{labels.select}</option>
                      {SENEGAL_REGIONS.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Paiement */}
              <div className="rounded-2xl p-6" style={{ background: "#111", border: "1px solid rgba(201,168,76,0.15)" }}>
                <h2 className="text-base font-bold text-white mb-5 flex items-center gap-2">
                  <span style={{ color: "#C9A84C" }}>02</span> {labels.paymentTitle}
                </h2>
                <div className="space-y-3 mb-5">
                  {paymentMethods.map(({ value, label, description, icon }) => (
                    <label
                      key={value}
                      className="flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200"
                      style={{
                        background: paymentMethod === value ? "rgba(201,168,76,0.08)" : "#0D0D0D",
                        border: `1px solid ${paymentMethod === value ? "rgba(201,168,76,0.4)" : "rgba(255,255,255,0.06)"}`,
                      }}
                    >
                      <input
                        type="radio"
                        name="payment.method"
                        value={value}
                        checked={paymentMethod === value}
                        onChange={() => setPaymentMethod(value)}
                        className="sr-only"
                      />
                      <span className="text-2xl">{icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{label}</p>
                        <p className="text-xs mt-0.5" style={{ color: "#6e6e73" }}>{description}</p>
                      </div>
                      <div
                        className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                        style={{ borderColor: paymentMethod === value ? "#C9A84C" : "#3a3a3f" }}
                      >
                        {paymentMethod === value && (
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#C9A84C" }} />
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                {needsPhone && (
                  <div className="mb-4">
                    <label style={labelStyle}>
                      {labels.paymentPhone.replace(
                        "{method}",
                        paymentMethod === "WAVE" ? "Wave" : "Orange Money"
                      )}
                    </label>
                    <input
                      name="payment.phone"
                      type="tel"
                      style={inputStyle}
                      required={needsPhone}
                      placeholder="+221 7X XXX XXXX"
                    />
                  </div>
                )}

                <div>
                  <label style={labelStyle}>{labels.notes}</label>
                  <textarea
                    name="payment.notes"
                    rows={3}
                    style={{ ...inputStyle, resize: "none" }}
                    placeholder={labels.notesPlaceholder}
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl px-4 py-3 text-sm"
                  style={{ background: "rgba(220,38,38,0.1)", border: "1px solid rgba(220,38,38,0.3)", color: "#f87171" }}>
                  {error}
                </div>
              )}
            </div>

            {/* RIGHT — Récapitulatif */}
            <aside>
              <div className="rounded-2xl p-6 sticky top-24" style={{ background: "#111", border: "1px solid rgba(201,168,76,0.2)" }}>
                <h2 className="text-base font-bold text-white mb-6">{labels.summary}</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm" style={{ color: "#86868b" }}>
                    <span>{itemCountLabel}</span>
                    <span className="tabular-nums text-white">{formatXOF(cart.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm" style={{ color: "#86868b" }}>
                    <span>{labels.delivery}</span>
                    <span style={{ color: "#C9A84C" }} className="font-medium">{labels.free}</span>
                  </div>
                  <div className="pt-3 mt-1" style={{ borderTop: "1px solid rgba(201,168,76,0.15)" }}>
                    <div className="flex justify-between font-bold text-lg">
                      <span className="text-white">{labels.total}</span>
                      <span className="tabular-nums" style={{ color: "#C9A84C" }}>{formatXOF(cart.total)}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full py-4 text-base font-bold rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                  style={{
                    background: "linear-gradient(135deg, #C9A84C, #E8C97A)",
                    color: "#000",
                    boxShadow: "0 4px 24px rgba(201,168,76,0.3)",
                  }}
                >
                  {isPending
                    ? labels.processing
                    : paymentMethod === "CASH_ON_DELIVERY"
                    ? labels.confirm
                    : `${labels.payWith} ${paymentMethods.find((m) => m.value === paymentMethod)?.label ?? ""}`}
                </button>

                <p className="text-xs text-center mt-3" style={{ color: "#3a3a3f" }}>
                  {labels.freeDakar}
                </p>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs" style={{ color: "#3a3a3f" }}>
                  <span>🔒</span>
                  <span>{labels.secure}</span>
                </div>
              </div>
            </aside>

          </div>
          </fieldset>
        </form>
      </div>
    </div>
  );
}
