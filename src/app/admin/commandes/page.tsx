import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from "@/lib/constants/orderStatus";
import { getServerSession } from "@/lib/auth/jwt";
import { getShippingAddressView } from "@/features/orders/shippingAddress";
import { formatXOF } from "@/features/payment/paydunya";

export const metadata = { title: "Commandes - Admin" };

const statusLabels = ORDER_STATUS_LABEL;
const statusStyle = ORDER_STATUS_STYLE;

const panel = {
  background: "rgba(17,17,9,0.84)",
  border: "1px solid rgba(201,168,76,0.14)",
  borderRadius: "16px",
  overflow: "hidden" as const,
};

const sectionLabel = {
  fontSize: "10px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.12em",
  color: "rgba(255,255,255,0.4)",
  marginBottom: "8px",
};

export default async function AdminCommandesPage() {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) redirect("/auth/login");

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } },
      items: { include: { product: true, variant: true } },
      payment: true,
      _count: { select: { items: true } },
    },
  });

  return (
    <div className="space-y-6 p-8">
      <div>
        <p className="text-[11px] uppercase tracking-[0.34em]" style={{ color: "#C9A84C" }}>
          Administration
        </p>
        <h1
          className="mt-2"
          style={{
            fontFamily: "var(--font-cormorant), serif",
            fontSize: "2.4rem",
            lineHeight: 0.96,
            color: "#fff",
          }}
        >
          Commandes
        </h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          {orders.length} commande{orders.length !== 1 ? "s" : ""} au total
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => {
          const shippingAddress = getShippingAddressView(order.shippingAddress);
          const guestName = shippingAddress?.firstName
            ? `${shippingAddress.firstName} ${shippingAddress.lastName ?? ""}`.trim()
            : "Guest";
          const location = [shippingAddress?.city, shippingAddress?.region]
            .filter(Boolean)
            .join(", ");

          return (
            <div key={order.id} style={panel}>
              {/* Header */}
              <div
                className="flex flex-wrap items-center justify-between gap-4 p-5"
                style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}
              >
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono text-sm font-semibold" style={{ color: "#fff" }}>
                      {order.orderNumber}
                    </p>
                    <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                      {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <span
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={statusStyle[order.status] ?? statusStyle.PENDING}
                  >
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </div>
                <span className="text-lg font-bold tabular-nums" style={{ color: "#C9A84C" }}>
                  {formatXOF(Number(order.total))}
                </span>
              </div>

              {/* Body */}
              <div className="grid gap-0 md:grid-cols-3" style={{ borderTop: "none" }}>
                {/* Client */}
                <div className="space-y-1 p-5" style={{ borderRight: "1px solid rgba(201,168,76,0.08)" }}>
                  <p style={sectionLabel}>Client</p>
                  <p className="text-sm font-medium" style={{ color: "#fff" }}>
                    {order.user?.name ?? guestName}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {order.user?.email ?? order.guestEmail ?? "-"}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
                    {shippingAddress?.phone ?? order.guestPhone ?? "-"}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.36)" }}>
                    {location || "Adresse a confirmer"}
                  </p>
                </div>

                {/* Articles */}
                <div className="p-5" style={{ borderRight: "1px solid rgba(201,168,76,0.08)" }}>
                  <p style={sectionLabel}>Articles ({order._count.items})</p>
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="flex-1 truncate" style={{ color: "rgba(255,255,255,0.6)" }}>
                          {item.productName} — {item.variantName} ×{item.quantity}
                        </span>
                        <span className="ml-2 shrink-0 font-medium" style={{ color: "#fff" }}>
                          {formatXOF(Number(item.totalPrice))}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs" style={{ color: "rgba(255,255,255,0.36)" }}>
                    {order.paymentMethod} · {order.payment?.status ?? "-"}
                  </p>
                </div>

                {/* Statut */}
                <div className="p-5">
                  <p style={sectionLabel}>Changer le statut</p>
                  <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="p-12 text-center" style={panel}>
            <p style={{ color: "rgba(255,255,255,0.4)" }}>Aucune commande pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
