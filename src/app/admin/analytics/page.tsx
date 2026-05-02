// src/app/admin/analytics/page.tsx
import { redirect } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Users,
  DollarSign,
  BarChart3,
  Package,
} from "lucide-react";
import prisma from "@/lib/db/prisma";
import { getAnalyticsData } from "@/features/orders/actions";
import { formatXOF } from "@/features/payment/paydunya";
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE } from "@/lib/constants/orderStatus";

export const dynamic = "force-dynamic";

export const metadata = { title: "Analytiques" };

async function getMonthlyRevenue() {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: sixMonthsAgo },
      status: { in: ["DELIVERED", "SHIPPED", "PROCESSING", "CONFIRMED"] },
    },
    select: { createdAt: true, total: true },
  });

  const result: Record<string, number> = {};
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    result[key] = 0;
  }

  for (const order of orders) {
    const key = `${order.createdAt.getFullYear()}-${String(order.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (key in result) result[key] += Number(order.total);
  }

  return result;
}

const panel: React.CSSProperties = {
  background: "rgba(17,17,9,0.84)",
  border: "1px solid rgba(201,168,76,0.14)",
  borderRadius: "16px",
};

export default async function AnalyticsPage() {
  const [data, monthlyRevenue] = await Promise.all([
    getAnalyticsData(),
    getMonthlyRevenue(),
  ]);

  if (!data) redirect("/auth/login");

  const maxRevenue = Math.max(...Object.values(monthlyRevenue), 1);
  const stats = [
    {
      title: "Chiffre d'affaires total",
      value: formatXOF(data.revenue.total),
      sub: `Ce mois : ${formatXOF(data.revenue.month)}`,
      change: data.revenue.growth,
      icon: DollarSign,
      gold: true,
    },
    {
      title: "Commandes totales",
      value: data.orders.total.toString(),
      sub: `Ce mois : ${data.orders.month}`,
      change: null,
      icon: ShoppingBag,
      gold: false,
    },
    {
      title: "Clients",
      value: data.customers.total.toString(),
      sub: `+${data.customers.new} ce mois`,
      change: null,
      icon: Users,
      gold: false,
    },
    {
      title: "Croissance vs mois dernier",
      value: `${data.revenue.growth >= 0 ? "+" : ""}${data.revenue.growth.toFixed(1)}%`,
      sub: `Mois dernier : ${formatXOF(data.revenue.lastMonth)}`,
      change: data.revenue.growth,
      icon: BarChart3,
      gold: true,
    },
  ];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytiques</h1>
        <p className="mt-1" style={{ color: "rgba(255,255,255,0.46)" }}>
          Vue d&apos;ensemble des performances
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ title, value, sub, change, icon: Icon, gold }) => (
          <div key={title} className="p-6" style={panel}>
            <div className="flex items-start justify-between mb-4">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{
                  background: gold ? "rgba(201,168,76,0.12)" : "rgba(255,255,255,0.05)",
                  border: gold ? "1px solid rgba(201,168,76,0.2)" : "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <Icon
                  className="w-5 h-5"
                  style={{ color: gold ? "#C9A84C" : "rgba(255,255,255,0.5)" }}
                />
              </div>
              {change !== null && (
                <div
                  className="flex items-center gap-1 text-xs font-medium"
                  style={{ color: change >= 0 ? "#C9A84C" : "rgba(255,255,255,0.4)" }}
                >
                  {change >= 0 ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  {Math.abs(change).toFixed(1)}%
                </div>
              )}
            </div>
            <p className="text-2xl font-bold text-white tabular-nums">{value}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>{title}</p>
            <p className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.3)" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
      <div className="p-6" style={panel}>
        <h2 className="text-sm font-semibold mb-6" style={{ color: "rgba(255,255,255,0.7)" }}>
          Chiffre d&apos;affaires — 6 derniers mois
        </h2>
        <div className="flex items-end gap-3 h-40">
          {Object.entries(monthlyRevenue).map(([month, revenue]) => {
            const barHeight = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
            const label = new Date(`${month}-02`).toLocaleDateString("fr-FR", {
              month: "short",
              year: "2-digit",
            });
            return (
              <div key={month} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-[10px] font-medium tabular-nums" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {revenue > 0 ? formatXOF(revenue).replace("F CFA", "").trim() : "-"}
                </span>
                <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                  <div
                    className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(barHeight, revenue > 0 ? 4 : 0)}%`,
                      background: "linear-gradient(to top, #C9A84C, #E8C97A)",
                    }}
                    title={formatXOF(revenue)}
                  />
                </div>
                <span className="text-[10px] capitalize" style={{ color: "rgba(255,255,255,0.3)" }}>{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top products */}
        <div className="p-6" style={panel}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)" }}>
              Top 5 produits
            </h2>
            <Package className="w-4 h-4" style={{ color: "rgba(255,255,255,0.3)" }} />
          </div>
          <div className="space-y-4">
            {data.topProducts.map((product, index) => {
              const total = Number(product._sum.totalPrice ?? 0);
              const maxTotal = Number(data.topProducts[0]?._sum.totalPrice ?? 1);
              const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
              return (
                <div key={product.productId}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs w-4 tabular-nums shrink-0" style={{ color: "#C9A84C" }}>
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-white truncate">
                        {product.productName}
                      </span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-semibold text-white tabular-nums">
                        {formatXOF(total)}
                      </p>
                      <p className="text-[10px]" style={{ color: "rgba(255,255,255,0.35)" }}>
                        {product._sum.quantity} vendu(s)
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, background: "linear-gradient(to right, #C9A84C, #E8C97A)" }}
                    />
                  </div>
                </div>
              );
            })}
            {data.topProducts.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Aucune vente enregistrée
              </p>
            )}
          </div>
        </div>

        {/* Orders by status */}
        <div className="p-6" style={panel}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
            Commandes par statut
          </h2>
          <div className="space-y-3">
            {data.orders.byStatus.map(({ status, _count }) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`badge ${ORDER_STATUS_BADGE[status] ?? "badge-gray"}`}>
                  {ORDER_STATUS_LABEL[status] ?? status}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${data.orders.total > 0 ? (_count / data.orders.total) * 100 : 0}%`,
                        background: "rgba(201,168,76,0.6)",
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-white tabular-nums w-6 text-right">
                    {_count}
                  </span>
                </div>
              </div>
            ))}
            {data.orders.byStatus.length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: "rgba(255,255,255,0.3)" }}>
                Aucune commande
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
