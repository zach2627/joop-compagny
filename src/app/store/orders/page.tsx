import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { getShippingAddressView } from "@/features/orders/shippingAddress";
import { productThumbnailImage } from "@/lib/images/cloudinary";
import { getProductImageUrl } from "@/lib/images/product-gallery";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import { ORDER_STATUS_STYLE } from "@/lib/constants/orderStatus";
import {
  translateProductContent,
  translateVariantName,
} from "@/lib/i18n/product-content";
import prisma from "@/lib/db/prisma";

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
          style={{
            minHeight: "100vh",
            background:
              "radial-gradient(circle at top right, rgba(201,168,76,0.14), transparent 24%), linear-gradient(180deg, #0a0a08 0%, #15150f 100%)",
          }}
        >
          <div className="mx-auto max-w-lg space-y-6 pt-20 text-center">
            <div
              className="mx-auto flex h-20 w-20 items-center justify-center rounded-full text-xs font-semibold uppercase tracking-[0.28em]"
              style={{
                background: "rgba(17,17,9,0.86)",
                border: "1px solid rgba(201,168,76,0.16)",
                color: "var(--color-primary-dark)",
              }}
            >
              JOOP
            </div>
            <h1
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "clamp(2.3rem, 5vw, 3.7rem)",
                lineHeight: 0.96,
              }}
            >
              {dict.account.confirmed}
            </h1>
            <p className="text-sm luxe-copy">{dict.account.receivedWithNumber(recentOrderNumber)}</p>

            <div className="luxe-panel space-y-3 p-5 text-left">
              {[
                { icon: "01", text: dict.account.deliveryInfo },
                { icon: "02", text: dict.account.phoneInfo },
                { icon: "03", text: dict.account.warrantyInfo },
              ].map(({ icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-sm"
                  style={{ color: "var(--color-text)" }}
                >
                  <span style={{ color: "var(--color-primary-dark)" }}>{icon}</span>
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
              <Link href={localizedPath("/auth/login", locale)} className="btn-secondary px-6 py-2.5 text-sm">
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
    <div
      className="px-4 py-10 md:py-14"
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top right, rgba(201,168,76,0.14), transparent 24%), linear-gradient(180deg, #0a0a08 0%, #15150f 100%)",
      }}
    >
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="luxe-kicker mb-1">{dict.account.personalSpace}</p>
            <h1
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "clamp(2.3rem, 4vw, 3.8rem)",
                lineHeight: 0.96,
              }}
            >
              {dict.account.orders}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {dict.account.ordersCount(orders.length)}
            </p>
          </div>

          <Link href={localizedPath("/store/account", locale)} className="btn-secondary">
            {dict.account.backToAccount}
          </Link>
        </div>

        {recentOrderNumber ? (
          <div
            className="flex items-center gap-4 rounded-[28px] p-5"
            style={{
              background: "rgba(184,138,84,0.1)",
              border: "1px solid rgba(184,138,84,0.16)",
            }}
          >
            <span
              className="inline-flex h-10 w-10 items-center justify-center rounded-full"
              style={{
                background: "rgba(17,17,9,0.84)",
                color: "var(--color-primary-dark)",
              }}
            >
              OK
            </span>
            <div>
              <p className="font-semibold" style={{ color: "var(--color-primary-dark)" }}>
                {dict.account.confirmed}
              </p>
              <p className="mt-0.5 text-sm" style={{ color: "var(--color-text-secondary)" }}>
                {dict.account.receivedWithNumber(recentOrderNumber)}
              </p>
            </div>
          </div>
        ) : null}

        {orders.length === 0 ? (
          <div className="luxe-panel p-12 text-center">
            <p
              className="mb-4"
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "3rem",
                color: "var(--color-primary-dark)",
              }}
            >
              Bag
            </p>
            <p className="mb-2 font-medium" style={{ color: "var(--color-text)" }}>
              {dict.account.empty}
            </p>
            <p className="mb-6 text-sm" style={{ color: "var(--color-text-secondary)" }}>
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
                  className="overflow-hidden rounded-[30px]"
                  style={{
                    background: "rgba(17,17,9,0.84)",
                    border: "1px solid rgba(201,168,76,0.12)",
                    boxShadow: "0 20px 46px rgba(0,0,0,0.32)",
                  }}
                >
                  <div
                    className="flex flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between"
                    style={{ borderBottom: "1px solid rgba(184,138,84,0.08)" }}
                  >
                    <div>
                      <p className="text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                        {order.orderNumber}
                      </p>
                      <p className="mt-1 text-xs" style={{ color: "var(--color-text-secondary)" }}>
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
                      <p className="text-sm font-bold" style={{ color: "var(--color-primary-dark)" }}>
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
                            className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[18px]"
                            style={{
                              background:
                                "linear-gradient(180deg, rgba(17,17,9,0.96) 0%, rgba(10,10,8,0.94) 100%)",
                            }}
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
                            <p className="truncate text-sm font-medium" style={{ color: "var(--color-text)" }}>
                              {productText.name}
                            </p>
                            <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
                              {variantName} - {dict.account.quantity}: {item.quantity}
                            </p>
                          </div>

                          <p className="shrink-0 text-sm font-semibold" style={{ color: "var(--color-text)" }}>
                            {Number(item.totalPrice).toLocaleString(dateLocale)} F
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {addressLine ? (
                    <div
                      className="px-6 py-3 text-xs"
                      style={{
                        borderTop: "1px solid rgba(184,138,84,0.08)",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      Adresse: {addressLine}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
