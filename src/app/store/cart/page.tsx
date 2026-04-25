// src/app/store/cart/page.tsx
import Link from "next/link";
import { getCartData } from "@/features/cart/actions";
import { formatXOF } from "@/features/payment/paydunya";
import { CartItemRow } from "@/components/cart/CartItemRow";
import type { Metadata } from "next";
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
      <div style={{ background: "#0D0D0D", minHeight: "100vh" }}
        className="flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-6">🛍️</div>
          <h1 className="text-2xl font-semibold mb-3" style={{ color: "#FFFFFF" }}>
            {dict.cart.emptyTitle}
          </h1>
          <p className="mb-8" style={{ color: "#6e6e73" }}>
            {dict.cart.emptyText}
          </p>
          <Link href={localizedPath("/store/products", locale)} className="btn-primary px-8 py-3.5">
            {dict.cart.explore}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }}>
      <div className="container-xl py-12">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase mb-2" style={{ color: "#C9A84C" }}>
            {dict.cart.eyebrow}
          </p>
          <h1 className="font-black text-white" style={{ fontSize: "clamp(2rem, 5vw, 3rem)", letterSpacing: "-0.03em" }}>
            {dict.cart.heading(itemCount)}
          </h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Articles */}
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

          {/* Récapitulatif */}
          <aside className="lg:w-[360px] shrink-0">
            <div className="rounded-2xl p-6 sticky top-24"
              style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.2)" }}>
              <h2 className="text-lg font-semibold mb-6" style={{ color: "#FFFFFF" }}>
                {dict.cart.summary}
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm" style={{ color: "#86868b" }}>
                  <span>{dict.cart.items(itemCount)}</span>
                  <span className="tabular-nums text-white">{formatXOF(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm" style={{ color: "#86868b" }}>
                  <span>{dict.cart.delivery}</span>
                  <span style={{ color: "#C9A84C" }} className="font-medium">{dict.cart.toCalculate}</span>
                </div>
                <div className="border-t pt-3 mt-3" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
                  <div className="flex justify-between font-bold text-lg">
                    <span className="text-white">{dict.cart.total}</span>
                    <span className="tabular-nums" style={{ color: "#C9A84C" }}>{formatXOF(total)}</span>
                  </div>
                </div>
              </div>

              <Link href={localizedPath("/store/checkout", locale)} className="btn-primary w-full py-4 text-base block text-center">
                {dict.cart.checkout}
              </Link>

              <div className="mt-4 space-y-2">
                {[
                  { icon: "🔒", text: dict.cart.securePayment },
                  { icon: "🌊", text: dict.cart.paymentMethods },
                ].map(({ icon, text }) => (
                  <div key={text} className="flex items-center gap-2 text-xs" style={{ color: "#515154" }}>
                    <span>{icon}</span>
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
