import Link from "next/link";
import type { Metadata } from "next";
import { CartItemRow } from "@/components/cart/CartItemRow";
import { getCartData } from "@/features/cart/actions";
import { formatXOF } from "@/features/payment/paydunya";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import {
  translateProductContent,
  translateVariantName,
} from "@/lib/i18n/product-content";

export function generateMetadata(): Metadata {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  return { title: dict.cart.title };
}

export default async function CartPage() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const { items, subtotal, total, itemCount } = await getCartData();

  if (itemCount === 0) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(201,168,76,0.14), transparent 24%), linear-gradient(180deg, #0a0a08 0%, #15150f 100%)",
        }}
      >
        <div className="max-w-md text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-xs font-semibold uppercase tracking-[0.32em]"
            style={{
              background: "rgba(17,17,9,0.86)",
              border: "1px solid rgba(201,168,76,0.16)",
              color: "var(--color-primary-dark)",
              boxShadow: "0 16px 34px rgba(0,0,0,0.32)",
            }}
          >
            JOOP
          </div>
          <h1
            className="mb-3"
            style={{
              fontFamily: "var(--font-cormorant), serif",
              fontSize: "clamp(2.2rem, 5vw, 3.6rem)",
              lineHeight: 0.96,
            }}
          >
            {dict.cart.emptyTitle}
          </h1>
          <p className="mb-8 luxe-copy">{dict.cart.emptyText}</p>
          <Link
            href={localizedPath("/store/products", locale)}
            className="btn-primary px-8 py-3.5"
          >
            {dict.cart.explore}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(201,168,76,0.14), transparent 24%), linear-gradient(180deg, #0a0a08 0%, #15150f 100%)",
      }}
    >
      <div className="container-xl py-10 md:py-14">
        <div className="mb-8">
          <p className="luxe-kicker mb-2">{dict.cart.eyebrow}</p>
          <h1
            style={{
              fontSize: "clamp(2.4rem, 5vw, 4.2rem)",
              lineHeight: 0.94,
            }}
          >
            {dict.cart.heading(itemCount)}
          </h1>
        </div>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1 space-y-4">
            {items.map((item) => {
              const productText = translateProductContent(locale, item.product);

              return (
                <CartItemRow
                  key={item.id}
                  item={{
                    id: item.id,
                    productName: productText.name,
                    variantName: translateVariantName(
                      locale,
                      item.product.slug,
                      item.variant.name
                    ),
                    sku: item.variant.sku,
                    imageUrl: item.product.images[0]?.url,
                    price: Number(item.variant.price),
                    quantity: item.quantity,
                    maxStock: item.variant.stock,
                    slug: item.product.slug ?? "",
                  }}
                  locale={locale}
                  labels={{
                    sku: dict.cart.sku,
                    decrease: dict.cart.decrease,
                    increase: dict.cart.increase,
                    remove: dict.cart.remove,
                  }}
                />
              );
            })}
          </div>

          <aside className="shrink-0 lg:w-[380px]">
            <div
              className="sticky top-28 rounded-[30px] p-6"
              style={{
                background: "rgba(17,17,9,0.86)",
                border: "1px solid rgba(201,168,76,0.16)",
                boxShadow: "0 26px 58px rgba(0,0,0,0.34)",
                backdropFilter: "blur(18px)",
              }}
            >
              <h2
                className="mb-6"
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "2rem",
                  lineHeight: 1,
                }}
              >
                {dict.cart.summary}
              </h2>

              <div className="mb-6 space-y-3">
                <div
                  className="flex justify-between text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <span>{dict.cart.items(itemCount)}</span>
                  <span className="tabular-nums" style={{ color: "var(--color-text)" }}>
                    {formatXOF(subtotal)}
                  </span>
                </div>
                <div
                  className="flex justify-between text-sm"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <span>{dict.cart.delivery}</span>
                  <span className="font-medium" style={{ color: "var(--color-primary-dark)" }}>
                    {dict.cart.toCalculate}
                  </span>
                </div>
                <div
                  className="mt-3 border-t pt-3"
                  style={{ borderColor: "rgba(184,138,84,0.12)" }}
                >
                  <div className="flex justify-between text-lg font-bold">
                    <span style={{ color: "var(--color-text)" }}>{dict.cart.total}</span>
                    <span className="tabular-nums" style={{ color: "var(--color-primary-dark)" }}>
                      {formatXOF(total)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={localizedPath("/store/checkout", locale)}
                className="btn-primary block w-full py-4 text-center text-base"
              >
                {dict.cart.checkout}
              </Link>

              <div className="mt-4 space-y-2">
                {[
                  { index: "01", text: dict.cart.securePayment },
                  { index: "02", text: dict.cart.paymentMethods },
                ].map(({ index, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-2 text-xs"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    <span style={{ color: "var(--color-primary-dark)" }}>{index}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
