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
        style={{ background: "#0A0A08" }}
      >
        <div className="text-center">
          <div
            className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full text-xs font-semibold uppercase tracking-[0.32em]"
            style={{
              background: "#111109",
              border: "1px solid rgba(201,168,76,0.18)",
              color: "#C9A84C",
            }}
          >
            JOOP
          </div>
          <h1 className="mb-3 text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
            {dict.cart.emptyTitle}
          </h1>
          <p className="mb-8" style={{ color: "rgba(255,255,255,0.6)" }}>
            {dict.cart.emptyText}
          </p>
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
    <div style={{ background: "#0A0A08", minHeight: "100vh" }}>
      <div className="container-xl py-12">
        <div className="mb-8">
          <p
            className="mb-2 text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#C9A84C" }}
          >
            {dict.cart.eyebrow}
          </p>
          <h1
            className="font-black text-white"
            style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em" }}
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

          <aside className="shrink-0 lg:w-[360px]">
            <div
              className="sticky top-24 rounded-2xl p-6"
              style={{
                background: "#111109",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              <h2 className="mb-6 text-lg font-semibold" style={{ color: "#FFFFFF" }}>
                {dict.cart.summary}
              </h2>

              <div className="mb-6 space-y-3">
                <div
                  className="flex justify-between text-sm"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  <span>{dict.cart.items(itemCount)}</span>
                  <span className="tabular-nums text-white">{formatXOF(subtotal)}</span>
                </div>
                <div
                  className="flex justify-between text-sm"
                  style={{ color: "rgba(255,255,255,0.6)" }}
                >
                  <span>{dict.cart.delivery}</span>
                  <span className="font-medium" style={{ color: "#C9A84C" }}>
                    {dict.cart.toCalculate}
                  </span>
                </div>
                <div
                  className="mt-3 border-t pt-3"
                  style={{ borderColor: "rgba(201,168,76,0.15)" }}
                >
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-white">{dict.cart.total}</span>
                    <span className="tabular-nums" style={{ color: "#C9A84C" }}>
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
                    style={{ color: "rgba(255,255,255,0.4)" }}
                  >
                    <span style={{ color: "#C9A84C" }}>{index}</span>
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
