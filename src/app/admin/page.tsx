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

const panel = {
  background: "rgba(17,17,9,0.84)",
  border: "1px solid rgba(201,168,76,0.14)",
  borderRadius: "16px",
  boxShadow: "0 18px 40px rgba(0,0,0,0.28)",
};

const iconBox = {
  background: "rgba(201,168,76,0.1)",
  border: "1px solid rgba(201,168,76,0.18)",
  borderRadius: "10px",
};

const divider = { borderColor: "rgba(201,168,76,0.1)" };
const thStyle = {
  padding: "12px 24px",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "rgba(255,255,255,0.46)",
  background: "rgba(201,168,76,0.06)",
};

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
      gold: true,
    },
    {
      title: "Commandes (mois)",
      value: data.orders.month.toString(),
      sub: `Total: ${data.orders.total}`,
      change: null,
      icon: ShoppingBag,
      gold: false,
    },
    {
      title: "Produits actifs",
      value: data.products.active.toString(),
      sub: `Total: ${data.products.total} · A la une: ${data.products.featured}`,
      change: null,
      icon: Package,
      gold: true,
    },
    {
      title: "Clients",
      value: data.customers.total.toString(),
      sub: `+${data.customers.new} ce mois`,
      change: null,
      icon: Users,
      gold: false,
    },
  ];

  const statusLabels = ORDER_STATUS_LABEL;
  const statusColors = ORDER_STATUS_BADGE;

  return (
    <div className="space-y-8 p-8">
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
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          Bienvenue sur l&apos;espace admin JOOP COMPAGNY
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ title, value, sub, change, icon: Icon, gold }) => (
          <div key={title} className="p-6" style={panel}>
            <div className="mb-4 flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center" style={iconBox}>
                <Icon className="h-5 w-5" style={{ color: gold ? "#C9A84C" : "rgba(255,255,255,0.6)" }} />
              </div>
              {change !== null && (
                <div
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: change >= 0 ? "#C9A84C" : "rgba(255,255,255,0.46)" }}
                >
                  {change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {Math.abs(change).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold tabular-nums" style={{ color: "#fff" }}>{value}</p>
            <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>{title}</p>
            <p className="mt-0.5 text-xs" style={{ color: "rgba(255,255,255,0.32)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Commandes par statut + Top produits */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="p-6" style={panel}>
          <h2 className="mb-4 text-sm font-semibold" style={{ color: "#fff" }}>
            Commandes par statut
          </h2>
          <div className="space-y-3">
            {data.orders.byStatus.map(({ status, _count }) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`badge ${statusColors[status] ?? "badge-gray"}`}>
                  {statusLabels[status] ?? status}
                </span>
                <span className="text-sm font-semibold tabular-nums" style={{ color: "#fff" }}>
                  {_count}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-6" style={panel}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold" style={{ color: "#fff" }}>Top produits</h2>
            <Link href="/admin/produits" className="text-xs hover:underline" style={{ color: "#C9A84C" }}>
              Voir tout
            </Link>
          </div>
          <div className="space-y-3">
            {data.topProducts.map((product, index) => (
              <div key={product.productId} className="flex items-center gap-3">
                <span className="w-4 text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.32)" }}>
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium" style={{ color: "#fff" }}>
                    {product.productName}
                  </p>
                  <p className="text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {product._sum.quantity} vendu(s)
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color: "#C9A84C" }}>
                  {formatXOF(Number(product._sum.totalPrice ?? 0))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Commandes récentes */}
      <div style={{ ...panel, padding: 0, overflow: "hidden" }}>
        <div
          className="flex items-center justify-between p-6"
          style={{ borderBottom: "1px solid rgba(201,168,76,0.1)" }}
        >
          <h2 className="text-sm font-semibold" style={{ color: "#fff" }}>Commandes recentes</h2>
          <Link href="/admin/commandes" className="text-xs hover:underline" style={{ color: "#C9A84C" }}>
            Voir toutes
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["No Commande", "Client", "Articles", "Total", "Statut", "Date"].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="transition-colors"
                  style={{ borderTop: "1px solid rgba(201,168,76,0.07)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(201,168,76,0.04)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                >
                  <td className="px-6 py-4">
                    <Link href="/admin/commandes" className="font-mono text-xs font-medium hover:underline" style={{ color: "#C9A84C" }}>
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {order.user?.name ?? order.guestEmail ?? "-"}
                  </td>
                  <td className="px-6 py-4 tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {order._count.items}
                  </td>
                  <td className="px-6 py-4 font-semibold tabular-nums" style={{ color: "#fff" }}>
                    {formatXOF(Number(order.total))}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`badge ${statusColors[order.status] ?? "badge-gray"}`}>
                      {statusLabels[order.status] ?? order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs" style={{ color: "rgba(255,255,255,0.4)" }}>
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

      {/* Stock */}
      <div className="flex items-center justify-between gap-4 p-6" style={panel}>
        <div>
          <h2 className="text-sm font-semibold" style={{ color: "#fff" }}>Stock a surveiller</h2>
          <p className="mt-1 text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
            Variantes en faible stock ou deja en rupture.
          </p>
        </div>
        <span className="badge badge-gray">{data.products.lowStock} variante(s)</span>
      </div>
    </div>
  );
}
