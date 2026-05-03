import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata: Metadata = {
  title: "Mon compte | JOOP COMPANY",
  robots: { index: false, follow: false },
};
import { redirect } from "next/navigation";
import { ProductImageFallback } from "@/components/ui/ProductImageFallback";
import { logoutAction } from "@/features/auth/actions";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { productThumbnailImage } from "@/lib/images/cloudinary";
import { getProductImageUrl } from "@/lib/images/product-gallery";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import { ORDER_STATUS_STYLE } from "@/lib/constants/orderStatus";
import prisma from "@/lib/db/prisma";

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
              {dict.account.account}
            </h1>
            <p className="mt-2 text-sm" style={{ color: "var(--color-text-secondary)" }}>
              {user.email}
            </p>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              className="btn-secondary"
              style={{ minWidth: "140px" }}
            >
              {dict.account.logout}
            </button>
          </form>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="luxe-panel p-6">
            <h2
              className="mb-4"
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "1.8rem",
                color: "var(--color-primary-dark)",
              }}
            >
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
                  <p style={{ color: "var(--color-text-secondary)" }}>{label}</p>
                  <p className="mt-1 font-medium" style={{ color: "var(--color-text)" }}>
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {user.addresses[0] ? (
            <section className="luxe-panel p-6">
              <h2
                className="mb-4"
                style={{
                  fontFamily: "var(--font-cormorant), serif",
                  fontSize: "1.8rem",
                  color: "var(--color-primary-dark)",
                }}
              >
                {dict.account.defaultAddress}
              </h2>
              <div className="space-y-1 text-sm" style={{ color: "var(--color-text)" }}>
                <p>
                  {user.addresses[0].firstName} {user.addresses[0].lastName}
                </p>
                <p>{user.addresses[0].streetLine1}</p>
                {user.addresses[0].streetLine2 ? <p>{user.addresses[0].streetLine2}</p> : null}
                <p>
                  {user.addresses[0].city}, {user.addresses[0].region}
                </p>
                <p>{user.addresses[0].phone}</p>
              </div>
            </section>
          ) : null}
        </div>

        <section className="luxe-panel p-6">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h2
              style={{
                fontFamily: "var(--font-cormorant), serif",
                fontSize: "1.8rem",
                color: "var(--color-primary-dark)",
              }}
            >
              {dict.account.recentOrders}
            </h2>
            <Link href={localizedPath("/store/orders", locale)} className="btn-ghost">
              {dict.account.viewAll}
            </Link>
          </div>

          {user.orders.length === 0 ? (
            <div className="py-8 text-center text-sm">
              <p style={{ color: "var(--color-text-secondary)" }}>{dict.account.noRecentOrders}</p>
              <Link
                href={localizedPath("/store/products", locale)}
                className="mt-2 inline-block"
                style={{ color: "var(--color-primary-dark)" }}
              >
                {dict.account.discoverArrow}
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {user.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-[12px] p-4 md:flex-row md:items-center md:justify-between"
                  style={{
                    background: "rgba(17,17,9,0.86)",
                    border: "1px solid rgba(201,168,76,0.12)",
                  }}
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
                          className="overflow-hidden rounded-[18px]"
                          style={{
                            background:
                              "linear-gradient(180deg, rgba(17,17,9,0.96) 0%, rgba(10,10,8,0.94) 100%)",
                          }}
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
                      <p className="text-sm font-medium" style={{ color: "var(--color-text)" }}>
                        {order.orderNumber}
                      </p>
                      <p className="mt-0.5 text-xs" style={{ color: "var(--color-text-secondary)" }}>
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
                    <p className="text-sm font-semibold" style={{ color: "var(--color-primary-dark)" }}>
                      {Number(order.total).toLocaleString(dateLocale)} F
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
