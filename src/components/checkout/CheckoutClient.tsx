"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createOrderAction } from "@/features/orders/actions";
import { formatXOF } from "@/features/payment/paydunya";
import { localizedPath, type Locale } from "@/lib/i18n/config";

const SENEGAL_REGIONS = [
  "Dakar",
  "Thies",
  "Diourbel",
  "Fatick",
  "Kaolack",
  "Kolda",
  "Louga",
  "Matam",
  "Saint-Louis",
  "Sedhiou",
  "Tambacounda",
  "Ziguinchor",
  "Kaffrine",
  "Kedougou",
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
  border: "1px solid rgba(201,168,76,0.18)",
  background: "#1A1A14",
  color: "#FFFFFF",
  fontSize: "14px",
  outline: "none",
} as React.CSSProperties;

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: 600,
  color: "rgba(255,255,255,0.6)",
  marginBottom: "6px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
} as React.CSSProperties;

export function CheckoutClient({ cart, locale, labels }: CheckoutClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("WAVE");
  const paymentMethods = [
    { value: "WAVE", label: "Wave", description: labels.waveDesc, icon: "W" },
    {
      value: "ORANGE_MONEY",
      label: "Orange Money",
      description: labels.orangeDesc,
      icon: "OM",
    },
    {
      value: "CASH_ON_DELIVERY",
      label: labels.cashLabel,
      description: labels.cashDesc,
      icon: "COD",
    },
  ];

  const needsPhone = paymentMethod === "WAVE" || paymentMethod === "ORANGE_MONEY";
  const itemCountLabel = `${cart.itemCount} ${
    cart.itemCount > 1 ? labels.itemPlural : labels.itemSingular
  }`;

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    const formData = new FormData(event.currentTarget);
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
    <div style={{ background: "#0A0A08", minHeight: "100vh" }}>
      <div className="container-lg py-12">
        <div className="mb-10">
          <p
            className="mb-2 text-xs font-bold uppercase tracking-[0.25em]"
            style={{ color: "#C9A84C" }}
          >
            {labels.eyebrow}
          </p>
          <h1
            className="font-black text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em" }}
          >
            {labels.heading}
          </h1>
        </div>

        <form onSubmit={handleSubmit}>
          <fieldset disabled={isPending} style={{ border: "none", padding: 0, margin: 0 }}>
            <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
              <div className="space-y-6">
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "#111109",
                    border: "1px solid rgba(201,168,76,0.15)",
                  }}
                >
                  <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-white">
                    <span style={{ color: "#C9A84C" }}>01</span> {labels.addressTitle}
                  </h2>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label style={labelStyle}>{labels.firstName}</label>
                      <input
                        name="address.firstName"
                        style={inputStyle}
                        required
                        placeholder={labels.firstName.replace(" *", "")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{labels.lastName}</label>
                      <input
                        name="address.lastName"
                        style={inputStyle}
                        required
                        placeholder={labels.lastName.replace(" *", "")}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{labels.phone}</label>
                      <input
                        name="address.phone"
                        type="tel"
                        style={inputStyle}
                        required
                        placeholder="+221 77 XXX XXXX"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{labels.email}</label>
                      <input
                        name="address.email"
                        type="email"
                        style={inputStyle}
                        placeholder={labels.receiptPlaceholder}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label style={labelStyle}>{labels.street}</label>
                      <input
                        name="address.streetLine1"
                        style={inputStyle}
                        required
                        placeholder={labels.streetPlaceholder}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{labels.city}</label>
                      <input
                        name="address.city"
                        style={inputStyle}
                        required
                        placeholder={labels.cityPlaceholder}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>{labels.region}</label>
                      <select
                        name="address.region"
                        style={{ ...inputStyle, cursor: "pointer", colorScheme: "dark" }}
                        required
                        defaultValue=""
                      >
                        <option value="" disabled>
                          {labels.select}
                        </option>
                        {SENEGAL_REGIONS.map((region) => (
                          <option key={region} value={region}>
                            {region}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "#111109",
                    border: "1px solid rgba(201,168,76,0.15)",
                  }}
                >
                  <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-white">
                    <span style={{ color: "#C9A84C" }}>02</span> {labels.paymentTitle}
                  </h2>
                  <div className="mb-5 space-y-3">
                    {paymentMethods.map(({ value, label, description, icon }) => (
                      <label
                        key={value}
                        className="flex cursor-pointer items-center gap-4 rounded-xl p-4 transition-all duration-200"
                        style={{
                          background:
                            paymentMethod === value ? "rgba(201,168,76,0.08)" : "#1A1A14",
                          border: `1px solid ${
                            paymentMethod === value
                              ? "rgba(201,168,76,0.4)"
                              : "rgba(255,255,255,0.08)"
                          }`,
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
                        <span
                          className="inline-flex h-10 min-w-[40px] items-center justify-center rounded-full px-2 text-[10px] font-semibold uppercase tracking-[0.18em]"
                          style={{
                            background: "rgba(201,168,76,0.12)",
                            color: "#C9A84C",
                            border: "1px solid rgba(201,168,76,0.18)",
                          }}
                        >
                          {icon}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white">{label}</p>
                          <p
                            className="mt-0.5 text-xs"
                            style={{ color: "rgba(255,255,255,0.6)" }}
                          >
                            {description}
                          </p>
                        </div>
                        <div
                          className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all"
                          style={{
                            borderColor:
                              paymentMethod === value
                                ? "#C9A84C"
                                : "rgba(255,255,255,0.18)",
                          }}
                        >
                          {paymentMethod === value ? (
                            <div
                              className="h-2.5 w-2.5 rounded-full"
                              style={{ background: "#C9A84C" }}
                            />
                          ) : null}
                        </div>
                      </label>
                    ))}
                  </div>

                  {needsPhone ? (
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
                  ) : null}

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

                {error ? (
                  <div
                    className="rounded-xl px-4 py-3 text-sm"
                    style={{
                      background: "rgba(201,168,76,0.08)",
                      border: "1px solid rgba(201,168,76,0.2)",
                      color: "#FFFFFF",
                    }}
                  >
                    {error}
                  </div>
                ) : null}
              </div>

              <aside>
                <div
                  className="sticky top-24 rounded-2xl p-6"
                  style={{
                    background: "#111109",
                    border: "1px solid rgba(201,168,76,0.2)",
                  }}
                >
                  <h2 className="mb-6 text-base font-bold text-white">{labels.summary}</h2>

                  <div className="mb-6 space-y-3">
                    <div
                      className="flex justify-between text-sm"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      <span>{itemCountLabel}</span>
                      <span className="tabular-nums text-white">
                        {formatXOF(cart.subtotal)}
                      </span>
                    </div>
                    <div
                      className="flex justify-between text-sm"
                      style={{ color: "rgba(255,255,255,0.6)" }}
                    >
                      <span>{labels.delivery}</span>
                      <span className="font-medium" style={{ color: "#C9A84C" }}>
                        {labels.free}
                      </span>
                    </div>
                    <div
                      className="mt-1 pt-3"
                      style={{ borderTop: "1px solid rgba(201,168,76,0.15)" }}
                    >
                      <div className="flex justify-between text-lg font-bold">
                        <span className="text-white">{labels.total}</span>
                        <span className="tabular-nums" style={{ color: "#C9A84C" }}>
                          {formatXOF(cart.total)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded-xl py-4 text-base font-bold transition-all duration-300 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                    style={{
                      background: "#C9A84C",
                      color: "#0A0A08",
                      boxShadow: "0 4px 24px rgba(201,168,76,0.24)",
                    }}
                  >
                    {isPending
                      ? labels.processing
                      : paymentMethod === "CASH_ON_DELIVERY"
                      ? labels.confirm
                      : `${labels.payWith} ${
                          paymentMethods.find((method) => method.value === paymentMethod)
                            ?.label ?? ""
                        }`}
                  </button>

                  <p
                    className="mt-3 text-center text-xs"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    {labels.freeDakar}
                  </p>

                  <div
                    className="mt-4 flex items-center justify-center gap-2 text-xs"
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    <span style={{ color: "#C9A84C" }}>01</span>
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
