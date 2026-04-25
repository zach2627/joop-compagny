// src/app/store/orders/page.tsx
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";
import type { Metadata } from "next";
import { getShippingAddressView } from "@/features/orders/shippingAddress";
import { ORDER_STATUS_STYLE } from "@/lib/constants/orderStatus";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import {
  translateProductContent,
  translateVariantName,
} from "@/lib/i18n/product-content";
import { productThumbnailImage } from "@/lib/images/cloudinary";

export function generateMetadata(): Metadata {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  return {
    title: dict.account.orders,
    description: dict.account.trackOrders,
  };
}

interface PageProps {
  searchParams: { new?: string; order?: string; redirect?: string };
}

const statusStyle = ORDER_STATUS_STYLE;

export default async function OrdersPage({ searchParams }: PageProps) {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";
  const ordersPath = localizedPath("/store/orders", locale);
  const loginPath = localizedPath(
    `/auth/login?redirect=${encodeURIComponent(ordersPath)}`,
    locale
  );
  const statusLabel = dict.account.statuses as Record<string, string>;
  const paymentMethodLabel = dict.account.paymentMethods as Record<string, string>;
  const token = cookies().get("st_session")?.value;
  const requestedOrderNumber = searchParams.order ?? searchParams.new;
  const recentOrder = requestedOrderNumber
    ? await prisma.order.findUnique({
        where: { orderNumber: requestedOrderNumber },
        select: { orderNumber: true },
      })
    : null;
  const recentOrderNumber = recentOrder?.orderNumber;

  if (!token) {
    if (recentOrderNumber) {
      return (
        <div style={{ background: "#0D0D0D", minHeight: "100vh" }} className="py-12 px-4">
          <div className="max-w-lg mx-auto text-center space-y-6 pt-20">
            <div className="text-6xl">✓</div>
            <h1 className="text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
              {dict.account.confirmed}
            </h1>
            <p className="text-sm" style={{ color: "#86868b" }}>
              {dict.account.receivedWithNumber(recentOrderNumber)}
            </p>
            <div
              className="rounded-apple-xl p-5 text-left space-y-3"
              style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.2)" }}
            >
              {[
                { icon: "🚀", text: dict.account.deliveryInfo },
                { icon: "📞", text: dict.account.phoneInfo },
                { icon: "✅", text: dict.account.warrantyInfo },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "#d2d2d7" }}
                >
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href={localizedPath("/store/products", locale)} className="btn-primary px-6 py-2.5 text-sm">
                {dict.account.continueShopping}
              </Link>
              <Link
                href={localizedPath("/auth/login", locale)}
                className="text-sm px-6 py-2.5 rounded-full transition-all"
                style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
              >
                {dict.account.createAccount}
              </Link>
            </div>
          </div>
        </div>
      );
    }

    redirect(loginPath);
  }

  let payload: { userId: string; email: string; role: string };
  try {
    payload = await verifyAccessToken(token);
  } catch {
    redirect(loginPath);
  }

  const orders = await prisma.order.findMany({
    where: { userId: payload.userId },
    orderBy: { createdAt: "desc" },
    include: {
      items: {
        include: {
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
          variant: true,
        },
      },
      payment: true,
    },
  });

  return (
    <div style={{ background: "#0D0D0D", minHeight: "100vh" }} className="py-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="text-xs font-semibold tracking-widest uppercase mb-1"
              style={{ color: "#C9A84C" }}
            >
              {dict.account.personalSpace}
            </p>
            <h1 className="text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
              {dict.account.orders}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6e6e73" }}>
              {dict.account.ordersCount(orders.length)}
            </p>
          </div>
          <Link
            href={localizedPath("/store/account", locale)}
            className="text-sm px-4 py-2 rounded-full transition-all duration-200"
            style={{ color: "#C9A84C", border: "1px solid rgba(201,168,76,0.3)" }}
          >
            {dict.account.backToAccount}
          </Link>
        </div>

        {recentOrderNumber && (
          <div
            className="rounded-apple-xl p-5 flex items-center gap-4"
            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)" }}
          >
            <span className="text-2xl">✓</span>
            <div>
              <p className="font-semibold" style={{ color: "#4ADE80" }}>
                {dict.account.confirmed}
              </p>
              <p className="text-sm mt-0.5" style={{ color: "#86868b" }}>
                {dict.account.receivedWithNumber(recentOrderNumber)}
              </p>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div
            className="rounded-apple-xl p-12 text-center"
            style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <p className="text-4xl mb-4">🛍️</p>
            <p className="font-medium mb-2" style={{ color: "#FFFFFF" }}>
              {dict.account.empty}
            </p>
            <p className="text-sm mb-6" style={{ color: "#6e6e73" }}>
              {dict.account.emptyText}
            </p>
            <Link href={localizedPath("/store/products", locale)} className="btn-primary px-6 py-2.5 text-sm">
              {dict.account.discover}
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const shippingAddress = getShippingAddressView(order.shippingAddress);
              const addressLine = [
                shippingAddress?.streetLine1,
                shippingAddress?.city,
                shippingAddress?.region,
              ]
                .filter(Boolean)
                .join(", ");

              return (
              <div
                key={order.id}
                className="rounded-apple-xl overflow-hidden"
                style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.15)" }}
              >
                <div
                  className="flex items-center justify-between px-6 py-4"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#FFFFFF" }}>
                      {order.orderNumber}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "#6e6e73" }}>
                      {new Date(order.createdAt).toLocaleDateString(dateLocale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {" · "}
                      {paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs px-3 py-1 rounded-full font-medium"
                      style={statusStyle[order.status] ?? statusStyle.PENDING}
                    >
                      {statusLabel[order.status] ?? order.status}
                    </span>
                    <p className="text-sm font-bold" style={{ color: "#C9A84C" }}>
                      {Number(order.total).toLocaleString(dateLocale)} F
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 space-y-3">
                  {order.items.map((item) => {
                    const productText = translateProductContent(locale, item.product);
                    const variantName = translateVariantName(
                      locale,
                      item.product.slug,
                      item.variant.name
                    );

                    return (
                    <div key={item.id} className="flex items-center gap-4">
                      <div
                        className="w-14 h-14 rounded-apple-md overflow-hidden shrink-0 flex items-center justify-center"
                        style={{ background: "#242424" }}
                      >
                        {item.product.images[0] ? (
                          <Image
                            src={productThumbnailImage(item.product.images[0].url)}
                            alt={productText.name}
                            width={56}
                            height={56}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xl">📦</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "#FFFFFF" }}>
                          {productText.name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: "#6e6e73" }}>
                        {variantName} · {dict.account.quantity}: {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-semibold shrink-0" style={{ color: "#d2d2d7" }}>
                        {Number(item.totalPrice).toLocaleString(dateLocale)} F
                      </p>
                    </div>
                    );
                  })}
                </div>
                {addressLine && (
                  <div
                    className="px-6 py-3 text-xs"
                    style={{ borderTop: "1px solid rgba(255,255,255,0.06)", color: "#6e6e73" }}
                  >
                    📍 {addressLine}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
