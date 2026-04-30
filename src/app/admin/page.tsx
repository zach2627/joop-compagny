import Link from "next/link";
import { redirect } from "next/navigation";
import {
  DollarSign,
  Package,
  ShoppingBag,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { ORDER_STATUS_BADGE, ORDER_STATUS_LABEL } from "@/lib/constants/orderStatus";
import { getAnalyticsData } from "@/features/orders/actions";
import { formatXOF } from "@/features/payment/paydunya";

export default async function AdminDashboard() {
  const data = await getAnalyticsData();
  if (!data) redirect("/auth/login");

  const revenueGrowth = data.revenue.growth;

  const stats = [
    {
      title: "Chiffre d'affaires (mois)",
      value: formatXOF(data.revenue.month),
      sub: `Total: ${formatXOF(data.revenue.total)}`,
      change: revenueGrowth,
      icon: DollarSign,
      color: "blue",
    },
    {
      title: "Commandes (mois)",
      value: data.orders.month.toString(),
      sub: `Total: ${data.orders.total}`,
      change: null,
      icon: ShoppingBag,
      color: "green",
    },
    {
      title: "Produits actifs",
      value: data.products.active.toString(),
      sub: `Total: ${data.products.total} - A la une: ${data.products.featured}`,
      change: null,
      icon: Package,
      color: "amber",
    },
    {
      title: "Clients",
      value: data.customers.total.toString(),
      sub: `+${data.customers.new} ce mois`,
      change: null,
      icon: Users,
      color: "purple",
    },
  ];

  const statusLabels = ORDER_STATUS_LABEL;
  const statusColors = ORDER_STATUS_BADGE;

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-display-sm text-apple-gray-900">Tableau de bord</h1>
        <p className="mt-1 text-apple-gray-500">
          Bienvenue sur l&apos;espace admin JOOP COMPAGNY
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, sub, change, icon: Icon, color }) => (
          <div key={title} className="card p-6">
            <div className="mb-4 flex items-start justify-between">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-apple-md ${
                  color === "blue"
                    ? "bg-blue-50"
                    : color === "green"
                    ? "bg-green-50"
                    : color === "amber"
                    ? "bg-amber-50"
                    : "bg-amber-50"
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${
                    color === "blue"
                      ? "text-blue-600"
                      : color === "green"
                      ? "text-green-600"
                      : color === "amber"
                      ? "text-amber-600"
                      : "text-amber-600"
                  }`}
                />
              </div>
              {change !== null && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    change >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {change >= 0 ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {Math.abs(change).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-apple-gray-900 tabular-nums">{value}</p>
            <p className="mt-1 text-xs text-apple-gray-500">{title}</p>
            <p className="mt-0.5 text-xs text-apple-gray-400">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="mb-4 text-sm font-semibold text-apple-gray-900">
            Commandes par statut
          </h2>
          <div className="space-y-3">
            {data.orders.byStatus.map(({ status, _count }) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`badge ${statusColors[status] ?? "badge-gray"}`}>
                  {statusLabels[status] ?? status}
                </span>
                <span className="text-sm font-semibold text-apple-gray-900 tabular-nums">
                  {_count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-apple-gray-900">Top produits</h2>
            <Link href="/admin/produits" className="text-xs text-apple-blue hover:underline">
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {data.topProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center gap-3">
                <span className="w-4 text-xs text-apple-gray-400 tabular-nums">
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-apple-gray-900">
                    {product.productName}
                  </p>
                  <p className="text-xs text-apple-gray-400">
                    {product._sum.quantity} vendu(s)
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-apple-gray-900 tabular-nums">
                  {formatXOF(Number(product._sum.totalPrice ?? 0))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-apple-gray-100 p-6">
          <h2 className="text-sm font-semibold text-apple-gray-900">Commandes recentes</h2>
          <Link href="/admin/commandes" className="text-xs text-apple-blue hover:underline">
            Voir toutes
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-apple-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-apple-gray-500">
                  No Commande
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-apple-gray-500">
                  Client
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-apple-gray-500">
                  Articles
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-apple-gray-500">
                  Total
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-apple-gray-500">
                  Statut
                </th>
                <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-apple-gray-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-gray-100">
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-apple-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href="/admin/commandes"
                      className="font-mono text-xs font-medium text-apple-blue hover:underline"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-apple-gray-600">
                    {order.user?.name ?? order.guestEmail ?? "-"}
                  </td>
                  <td className="px-6 py-4 text-apple-gray-600 tabular-nums">
                    {order._count.items}
                  </td>
                  <td className="px-6 py-4 font-semibold text-apple-gray-900 tabular-nums">
                    {formatXOF(Number(order.total))}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusColors[order.status] ?? "badge-gray"}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-apple-gray-400">
                    {new Intl.DateTimeFormat("fr-SN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    }).format(new Date(order.createdAt))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-apple-gray-900">Stock a surveiller</h2>
            <p className="mt-1 text-xs text-apple-gray-500">
              Variantes en faible stock ou deja en rupture.
            </p>
          </div>
          <span className="badge badge-gray">{data.products.lowStock} variante(s)</span>
        </div>
      </div>
    </div>
  );
}
