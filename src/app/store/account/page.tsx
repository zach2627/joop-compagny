// src/app/store/account/page.tsx
import Image from "next/image";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAccessToken } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";
import { logoutAction } from "@/features/auth/actions";
import { ORDER_STATUS_STYLE } from "@/lib/constants/orderStatus";
import { localizedPath } from "@/lib/i18n/config";
import { getDictionary, getRequestLocale } from "@/lib/i18n/server";
import { productThumbnailImage } from "@/lib/images/cloudinary";

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
  if (!token) redirect(loginPath);

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

  if (!user) redirect(localizedPath("/auth/login", locale));

  const statusLabel = dict.account.statuses as Record<string, string>;
  const statusStyle = ORDER_STATUS_STYLE;

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
              {dict.account.account}
            </h1>
            <p className="text-sm mt-1" style={{ color: "#6e6e73" }}>
              {user.email}
            </p>
          </div>
          <form action={logoutAction}>
            <button
              type="submit"
              className="text-sm px-4 py-2 rounded-full transition-all duration-200"
              style={{ color: "#F87171", border: "1px solid rgba(248,113,113,0.3)" }}
            >
              {dict.account.logout}
            </button>
          </form>
        </div>

        <div
          className="rounded-apple-xl p-6"
          style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.15)" }}
        >
          <h2 className="text-base font-semibold mb-4" style={{ color: "#C9A84C" }}>
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
                <p style={{ color: "#6e6e73" }}>{label}</p>
                <p className="font-medium mt-0.5" style={{ color: "#FFFFFF" }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {user.addresses[0] && (
          <div
            className="rounded-apple-xl p-6"
            style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.15)" }}
          >
            <h2 className="text-base font-semibold mb-4" style={{ color: "#C9A84C" }}>
              {dict.account.defaultAddress}
            </h2>
            <div className="text-sm space-y-1" style={{ color: "#d2d2d7" }}>
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
          style={{ background: "#1A1A1A", border: "1px solid rgba(201,168,76,0.15)" }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold" style={{ color: "#C9A84C" }}>
              {dict.account.recentOrders}
            </h2>
            <Link href={localizedPath("/store/orders", locale)} className="text-sm hover:underline" style={{ color: "#C9A84C" }}>
              {dict.account.viewAll}
            </Link>
          </div>

          {user.orders.length === 0 ? (
            <div className="text-center py-8 text-sm">
              <p style={{ color: "#6e6e73" }}>{dict.account.noRecentOrders}</p>
              <Link
                href={localizedPath("/store/products", locale)}
                className="hover:underline mt-2 inline-block"
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
                  className="flex items-center justify-between p-4 rounded-apple-md"
                  style={{ background: "#242424", border: "1px solid #2E2E2E" }}
                >
                  <div className="flex items-center gap-3">
                    {order.items[0]?.product.images[0] && (
                      <Image
                        src={productThumbnailImage(order.items[0].product.images[0].url)}
                        alt=""
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded-apple-sm"
                        style={{ background: "#1A1A1A" }}
                      />
                    )}
                    <div>
                      <p className="text-sm font-medium" style={{ color: "#FFFFFF" }}>
                        {order.orderNumber}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "#6e6e73" }}>
                        {new Date(order.createdAt).toLocaleDateString(dateLocale)} · {dict.account.itemCount(order.items.length)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full font-medium"
                      style={
                        statusStyle[order.status] ?? {
                          background: "rgba(107,114,128,0.15)",
                          color: "#9CA3AF",
                        }
                      }
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
