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
        <h1 className="text-2xl font-bold text-apple-gray-900">Commandes</h1>
        <p className="mt-1 text-apple-gray-500">{orders.length} commandes au total</p>
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
            <div key={order.id} className="card overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-apple-gray-100 p-5">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="font-mono text-sm font-semibold text-apple-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="mt-0.5 text-xs text-apple-gray-400">
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
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-apple-gray-900">
                    {formatXOF(Number(order.total))}
                  </span>
                </div>
              </div>

              <div className="grid gap-0 divide-y divide-apple-gray-100 md:grid-cols-3 md:divide-x md:divide-y-0">
                <div className="space-y-1 p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-apple-gray-500">
                    Client
                  </p>
                  <p className="text-sm font-medium text-apple-gray-900">
                    {order.user?.name ?? guestName}
                  </p>
                  <p className="text-xs text-apple-gray-500">
                    {order.user?.email ?? order.guestEmail ?? "-"}
                  </p>
                  <p className="text-xs text-apple-gray-500">
                    {shippingAddress?.phone ?? order.guestPhone ?? "-"}
                  </p>
                  <p className="mt-1 text-xs text-apple-gray-400">
                    Localisation: {location || "Adresse a confirmer"}
                  </p>
                </div>

                <div className="p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-apple-gray-500">
                    Articles ({order._count.items})
                  </p>
                  <div className="space-y-1.5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-xs">
                        <span className="flex-1 truncate text-apple-gray-700">
                          {item.productName} - {item.variantName} x{item.quantity}
                        </span>
                        <span className="ml-2 shrink-0 font-medium text-apple-gray-900">
                          {formatXOF(Number(item.totalPrice))}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-2 text-xs text-apple-gray-400">
                    Paiement: {order.paymentMethod} - {order.payment?.status ?? "-"}
                  </p>
                </div>

                <div className="p-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-apple-gray-500">
                    Changer le statut
                  </p>
                  <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="card p-12 text-center">
            <p className="text-apple-gray-400">Aucune commande pour le moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
