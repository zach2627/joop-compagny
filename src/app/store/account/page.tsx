// src/app/store/account/page.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { logoutAction } from "@/features/auth/actions";
import { ORDER_STATUS_STYLE } from "@/lib/constants/orderStatus";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import { getProductImageUrl } from "@/lib/images/product-gallery";
import { productThumbnailImage } from "@/lib/images/cloudinary";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";

export default async function AccountPage() {
  const locale = getRequestLocale();
  const dict = getDictionary(locale);
  const dateLocale = locale === "en" ? "en-US" : "fr-FR";
  const accountPath = localizedPath("/store/account", locale);
  const loginPath = localizedPath(
    `/auth/login?redirect=${encodeURIComponent(accountPath)}`,
    locale
  );
  const token = cookies().get("st_session")?.value;

  if (!token) {
    redirect(loginPath);
  }

  let payload: { userId: string; email: string; role: string };
  try {
    payload = await verifyAccessToken(token);
  } catch {
    redirect(loginPath);
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      orders: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          items: {
            take: 1,
            include: {
              product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
            },
          },
        },
      },
      addresses: { where: { isDefault: true }, take: 1 },
    },
  });

  if (!user) {
    redirect(localizedPath("/auth/login", locale));
  }

  const statusLabel = dict.account.statuses as Record<string, string>;
  const statusStyle = ORDER_STATUS_STYLE;

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
            <h1 className="text-2xl font-semibold text-white">{dict.account.account}</h1>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
              {user.email}
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-full px-4 py-2 text-sm transition-all duration-200"
              style={{
                color: "#C9A84C",
                border: "1px solid rgba(201,168,76,0.3)",
              }}
            >
              {dict.account.logout}
            </button>
          </form>
        </div>

        <div
          className="rounded-apple-xl p-6"
          style={{ background: "#111109", border: "1px solid rgba(201,168,76,0.15)" }}
        >
          <h2 className="mb-4 text-base font-semibold" style={{ color: "#C9A84C" }}>
            {dict.account.personalInfo}
          </h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label: dict.account.name, value: user.name ?? "-" },
              { label: dict.account.email, value: user.email },
              { label: dict.account.phone, value: user.phone ?? "-" },
              {
                label: dict.account.memberSince,
                value: new Date(user.createdAt).toLocaleDateString(dateLocale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                }),
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <p style={{ color: "rgba(255,255,255,0.6)" }}>{label}</p>
                <p className="mt-0.5 font-medium text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {user.addresses[0] && (
          <div
            className="rounded-apple-xl p-6"
            style={{ background: "#111109", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <h2 className="mb-4 text-base font-semibold" style={{ color: "#C9A84C" }}>
              {dict.account.defaultAddress}
            </h2>
            <div className="space-y-1 text-sm text-white">
              <p>
                {user.addresses[0].firstName} {user.addresses[0].lastName}
              </p>
              <p>{user.addresses[0].streetLine1}</p>
              {user.addresses[0].streetLine2 && <p>{user.addresses[0].streetLine2}</p>}
              <p>
                {user.addresses[0].city}, {user.addresses[0].region}
              </p>
              <p>{user.addresses[0].phone}</p>
            </div>
          </div>
        )}

        <div
          className="rounded-apple-xl p-6"
          style={{ background: "#111109", border: "1px solid rgba(201,168,76,0.15)" }}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold" style={{ color: "#C9A84C" }}>
              {dict.account.recentOrders}
            </h2>
            <Link
              href={localizedPath("/store/orders", locale)}
              className="text-sm hover:underline"
              style={{ color: "#C9A84C" }}
            >
              {dict.account.viewAll}
            </Link>
          </div>

          {user.orders.length === 0 ? (
            <div className="py-8 text-center text-sm">
              <p style={{ color: "rgba(255,255,255,0.6)" }}>{dict.account.noRecentOrders}</p>
              <Link
                href={localizedPath("/store/products", locale)}
                className="mt-2 inline-block hover:underline"
                style={{ color: "#C9A84C" }}
              >
                {dict.account.discoverArrow}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {user.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-apple-md p-4"
                  style={{ background: "#1A1A14", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <div className="flex items-center gap-3">
                    {(() => {
                      const firstItem = order.items[0];
                      if (!firstItem) return null;

                      const imageUrl = getProductImageUrl(firstItem.product.slug, {
                        fallbackUrl: firstItem.product.images[0]?.url,
                      });

                      return (
                        <div
                          className="overflow-hidden rounded-apple-sm"
                          style={{ background: "#111109" }}
                        >
                          <ProductImageFallback
                            src={productThumbnailImage(imageUrl)}
                            alt={firstItem.product.name}
                            label={firstItem.product.name}
                            width={48}
                            height={48}
                            imageClassName="h-12 w-12 object-cover"
                            fallbackClassName="h-12 w-12"
                          />
                        </div>
                      );
                    })()}

                    <div>
                      <p className="text-sm font-medium text-white">{order.orderNumber}</p>
                      <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.6)" }}>
                        {new Date(order.createdAt).toLocaleDateString(dateLocale)} -{" "}
                        {dict.account.itemCount(order.items.length)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-medium"
                      style={statusStyle[order.status] ?? statusStyle.PENDING}
                    >
                      {statusLabel[order.status] ?? order.status}
                    </span>
                    <p className="text-sm font-semibold" style={{ color: "#C9A84C" }}>
                      {Number(order.total).toLocaleString(dateLocale)} F
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
