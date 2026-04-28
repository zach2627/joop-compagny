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
      color: "gold",
    },
    {
      title: "Commandes totales",
      value: data.orders.total.toString(),
      sub: `Ce mois : ${data.orders.month}`,
      change: null,
      icon: ShoppingBag,
      color: "surface",
    },
    {
      title: "Clients",
      value: data.customers.total.toString(),
      sub: `+${data.customers.new} ce mois`,
      change: null,
      icon: Users,
      color: "surface",
    },
    {
      title: "Croissance vs mois dernier",
      value: `${data.revenue.growth >= 0 ? "+" : ""}${data.revenue.growth.toFixed(1)}%`,
      sub: `Mois dernier : ${formatXOF(data.revenue.lastMonth)}`,
      change: data.revenue.growth,
      icon: BarChart3,
      color: "gold",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string }> = {
    gold: { bg: "bg-blue-50", text: "text-blue-600" },
    surface: { bg: "bg-white", text: "text-apple-gray-500" },
  };

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-display-sm text-apple-gray-900">Analytiques</h1>
        <p className="text-apple-gray-500 mt-1">Vue d&apos;ensemble des performances</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ title, value, sub, change, icon: Icon, color }) => (
          <div key={title} className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div
                className={`w-10 h-10 rounded-apple-md flex items-center justify-center ${colorMap[color].bg}`}
              >
                <Icon className={`w-5 h-5 ${colorMap[color].text}`} />
              </div>
              {change !== null && (
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    change >= 0 ? "text-apple-blue" : "text-apple-gray-500"
                  }`}
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
            <p className="text-2xl font-bold text-apple-gray-900 tabular-nums">{value}</p>
            <p className="text-xs text-apple-gray-500 mt-1">{title}</p>
            <p className="text-xs text-apple-gray-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-semibold text-apple-gray-900 mb-6">
          Chiffre d&apos;affaires - 6 derniers mois
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
                <span className="text-[10px] font-medium text-apple-gray-500 tabular-nums">
                  {revenue > 0 ? formatXOF(revenue).replace("F CFA", "").trim() : "-"}
                </span>
                <div className="w-full flex flex-col justify-end" style={{ height: "100px" }}>
                  <div
                    className="w-full rounded-t-md bg-blue-500 transition-all duration-500"
                    style={{ height: `${Math.max(barHeight, revenue > 0 ? 4 : 0)}%` }}
                    title={formatXOF(revenue)}
                  />
                </div>
                <span className="text-[10px] text-apple-gray-400 capitalize">{label}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-apple-gray-900">Top 5 produits</h2>
            <Package className="w-4 h-4 text-apple-gray-400" />
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
                      <span className="text-xs text-apple-gray-400 w-4 tabular-nums shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-apple-gray-900 truncate">
                        {product.productName}
                      </span>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <p className="text-sm font-semibold text-apple-gray-900 tabular-nums">
                        {formatXOF(total)}
                      </p>
                      <p className="text-[10px] text-apple-gray-400">
                        {product._sum.quantity} vendu(s)
                      </p>
                    </div>
                  </div>
                  <div className="h-1.5 bg-apple-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {data.topProducts.length === 0 && (
              <p className="text-sm text-apple-gray-400 text-center py-4">
                Aucune vente enregistrée
              </p>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-sm font-semibold text-apple-gray-900 mb-4">
            Commandes par statut
          </h2>
          <div className="space-y-3">
            {data.orders.byStatus.map(({ status, _count }) => (
              <div key={status} className="flex items-center justify-between">
                <span className={`badge ${ORDER_STATUS_BADGE[status] ?? "badge-gray"}`}>
                  {ORDER_STATUS_LABEL[status] ?? status}
                </span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-apple-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-apple-gray-400 rounded-full"
                      style={{
                        width: `${data.orders.total > 0 ? (_count / data.orders.total) * 100 : 0}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-apple-gray-900 tabular-nums w-6 text-right">
                    {_count}
                  </span>
                </div>
              </div>
            ))}
            {data.orders.byStatus.length === 0 && (
              <p className="text-sm text-apple-gray-400 text-center py-4">Aucune commande</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
