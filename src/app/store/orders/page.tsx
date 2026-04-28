// src/app/store/orders/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import type { Metadata } from "next";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getShippingAddressView } from "@/features/orders/shippingAddress";
import { ORDER_STATUS_STYLE } from "@/lib/constants/orderStatus";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import {
  translateProductContent,
  translateVariantName,
} from "@/lib/i18n/product-content";
import { getProductImageUrl } from "@/lib/images/product-gallery";
import { productThumbnailImage } from "@/lib/images/cloudinary";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";

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
        <div
          className="px-4 py-12"
          style={{ background: "#0A0A08", minHeight: "100vh" }}
        >
          <div className="mx-auto max-w-lg space-y-6 pt-20 text-center">
            <div className="text-6xl" style={{ color: "#C9A84C" }}>
              OK
            </div>
            <h1 className="text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
              {dict.account.confirmed}
            </h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {dict.account.receivedWithNumber(recentOrderNumber)}
            </p>

            <div
              className="space-y-3 rounded-apple-xl p-5 text-left"
              style={{
                background: "#111109",
                border: "1px solid rgba(201,168,76,0.2)",
              }}
            >
              {[
                { icon: "->", text: dict.account.deliveryInfo },
                { icon: "Tel", text: dict.account.phoneInfo },
                { icon: "OK", text: dict.account.warrantyInfo },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "#FFFFFF" }}
                >
                  <span>{icon}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href={localizedPath("/store/products", locale)}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                {dict.account.continueShopping}
              </Link>
              <Link
                href={localizedPath("/auth/login", locale)}
                className="rounded-full px-6 py-2.5 text-sm transition-all"
                style={{
                  color: "#C9A84C",
                  border: "1px solid rgba(201,168,76,0.3)",
                }}
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
    <div className="px-4 py-12" style={{ background: "#0A0A08", minHeight: "100vh" }}>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p
              className="mb-1 text-xs font-semibold uppercase tracking-widest"
              style={{ color: "#C9A84C" }}
            >
              {dict.account.personalSpace}
            </p>
            <h1 className="text-2xl font-semibold" style={{ color: "#FFFFFF" }}>
              {dict.account.orders}
            </h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {dict.account.ordersCount(orders.length)}
            </p>
          </div>

          <Link
            href={localizedPath("/store/account", locale)}
            className="rounded-full px-4 py-2 text-sm transition-all duration-200"
            style={{
              color: "#C9A84C",
              border: "1px solid rgba(201,168,76,0.3)",
            }}
          >
            {dict.account.backToAccount}
          </Link>
        </div>

        {recentOrderNumber && (
          <div
            className="flex items-center gap-4 rounded-apple-xl p-5"
            style={{
              background: "rgba(201,168,76,0.08)",
              border: "1px solid rgba(201,168,76,0.2)",
            }}
          >
            <span className="text-2xl" style={{ color: "#C9A84C" }}>
              OK
            </span>
            <div>
              <p className="font-semibold" style={{ color: "#C9A84C" }}>
                {dict.account.confirmed}
              </p>
              <p className="mt-0.5 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                {dict.account.receivedWithNumber(recentOrderNumber)}
              </p>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div
            className="rounded-apple-xl p-12 text-center"
            style={{
              background: "#111109",
              border: "1px solid rgba(201,168,76,0.15)",
            }}
          >
            <p className="mb-4 text-4xl" style={{ color: "#C9A84C" }}>
              Bag
            </p>
            <p className="mb-2 font-medium" style={{ color: "#FFFFFF" }}>
              {dict.account.empty}
            </p>
            <p className="mb-6 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {dict.account.emptyText}
            </p>
            <Link
              href={localizedPath("/store/products", locale)}
              className="btn-primary px-6 py-2.5 text-sm"
            >
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
                  className="overflow-hidden rounded-apple-xl"
                  style={{
                    background: "#111109",
                    border: "1px solid rgba(201,168,76,0.15)",
                  }}
                >
                  <div
                    className="flex items-center justify-between px-6 py-4"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                        {order.orderNumber}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {new Date(order.createdAt).toLocaleDateString(dateLocale, {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}{" "}
                        - {paymentMethodLabel[order.paymentMethod] ?? order.paymentMethod}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className="rounded-full px-3 py-1 text-xs font-medium"
                        style={statusStyle[order.status] ?? statusStyle.PENDING}
                      >
                        {statusLabel[order.status] ?? order.status}
                      </span>
                      <p className="text-sm font-bold" style={{ color: "#C9A84C" }}>
                        {Number(order.total).toLocaleString(dateLocale)} F
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 px-6 py-4">
                    {order.items.map((item) => {
                      const productText = translateProductContent(locale, item.product);
                      const variantName = translateVariantName(
                        locale,
                        item.product.slug,
                        item.variant.name
                      );
                      const imageUrl = getProductImageUrl(item.product.slug, {
                        color: item.variant.color,
                        fallbackUrl: item.product.images[0]?.url,
                      });

                      return (
                        <div key={item.id} className="flex items-center gap-4">
                          <div
                            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-apple-md"
                            style={{ background: "#1A1A14" }}
                          >
                            <ProductImageFallback
                              src={productThumbnailImage(imageUrl)}
                              alt={productText.name}
                              label={productText.name}
                              width={56}
                              height={56}
                              imageClassName="h-full w-full object-contain p-1"
                              fallbackClassName="h-full w-full"
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium" style={{ color: "#FFFFFF" }}>
                              {productText.name}
                            </p>
                            <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                              {variantName} - {dict.account.quantity}: {item.quantity}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold" style={{ color: "#FFFFFF" }}>
                            {Number(item.totalPrice).toLocaleString(dateLocale)} F
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {addressLine && (
                    <div
                      className="px-6 py-3 text-xs"
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        color: "rgba(255,255,255,0.6)",
                      }}
                    >
                      Adresse: {addressLine}
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
