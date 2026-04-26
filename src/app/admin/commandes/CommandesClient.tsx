"use client";

// src/app/admin/commandes/CommandesClient.tsx
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Search, Download, ShoppingBag, ChevronDown } from "lucide-react";
import { updateOrderStatusAction } from "@/features/orders/actions";
import { ORDER_STATUS_LABEL, ORDER_STATUS_STYLE } from "@/lib/constants/orderStatus";
import { formatXOF } from "@/features/payment/paydunya";

type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

type PaymentMethod = "WAVE" | "ORANGE_MONEY" | "CASH_ON_DELIVERY" | "CARD";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  guestEmail: string | null;
  createdAt: string;
  user: { name: string | null; email: string } | null;
  payment: { status: string } | null;
  itemCount: number;
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
  CASH_ON_DELIVERY: "Livraison",
  CARD: "Carte",
};

const ALL_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
];

const STATUS_TABS: Array<{ value: OrderStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "Toutes" },
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmées" },
  { value: "PROCESSING", label: "En traitement" },
  { value: "SHIPPED", label: "Expédiées" },
  { value: "DELIVERED", label: "Livrées" },
  { value: "CANCELLED", label: "Annulées" },
];

export default function CommandesClient({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<OrderStatus | "ALL">("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = orders.filter((o) => {
    const matchTab = activeTab === "ALL" || o.status === activeTab;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      o.orderNumber.toLowerCase().includes(q) ||
      (o.user?.name ?? "").toLowerCase().includes(q) ||
      (o.user?.email ?? "").toLowerCase().includes(q) ||
      (o.guestEmail ?? "").toLowerCase().includes(q);
    return matchTab && matchSearch;
  });

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    setUpdatingId(orderId);
    setUpdateError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction({ orderId, status });
      setUpdatingId(null);
      if (!result.success) {
        setUpdateError(result.error ?? "Erreur inconnue");
      } else {
        router.refresh();
      }
    });
  };

  const handleExport = () => {
    const headers = [
      "N° Commande",
      "Client",
      "Email",
      "Articles",
      "Total (XOF)",
      "Paiement",
      "Statut",
      "Date",
    ];
    const rows = filtered.map((o) => [
      o.orderNumber,
      o.user?.name ?? "Invité",
      o.user?.email ?? o.guestEmail ?? "",
      o.itemCount,
      o.total,
      PAYMENT_METHOD_LABEL[o.paymentMethod] ?? o.paymentMethod,
      ORDER_STATUS_LABEL[o.status] ?? o.status,
      new Date(o.createdAt).toLocaleDateString("fr-FR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `commandes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-apple-md bg-apple-blue/10 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5 text-apple-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-apple-gray-900">Commandes</h1>
            <p className="text-sm text-apple-gray-500">
              {orders.length} commande{orders.length > 1 ? "s" : ""} au total
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-apple-md bg-apple-gray-100
                     text-sm font-medium text-apple-gray-700 hover:bg-apple-gray-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Error */}
      {updateError && (
        <div className="mb-4 px-4 py-3 rounded-apple-md bg-red-50 border border-red-200 text-sm text-red-700">
          {updateError}
        </div>
      )}

      {/* Status tabs */}
      <div className="flex gap-1.5 mb-6 overflow-x-auto no-scrollbar pb-1">
        {STATUS_TABS.map(({ value, label }) => {
          const count =
            value === "ALL"
              ? orders.length
              : orders.filter((o) => o.status === value).length;
          return (
            <button
              key={value}
              onClick={() => setActiveTab(value)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
                          transition-colors whitespace-nowrap
                          ${
                            activeTab === value
                              ? "bg-apple-gray-900 text-white"
                              : "bg-apple-gray-100 text-apple-gray-600 hover:bg-apple-gray-200"
                          }`}
            >
              {label}
              <span
                className={`text-xs px-1.5 py-0.5 rounded-full
                  ${
                    activeTab === value
                      ? "bg-white/20 text-white"
                      : "bg-apple-gray-200 text-apple-gray-500"
                  }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par numéro, nom ou email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-apple-md border border-apple-gray-200
                     text-sm bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/30
                     focus:border-apple-blue transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-apple-lg border border-apple-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-apple-gray-100 bg-apple-gray-50">
                <th className="text-left px-6 py-3 font-semibold text-apple-gray-600 whitespace-nowrap">
                  N° Commande
                </th>
                <th className="text-left px-6 py-3 font-semibold text-apple-gray-600">
                  Client
                </th>
                <th className="text-center px-6 py-3 font-semibold text-apple-gray-600">
                  Art.
                </th>
                <th className="text-left px-6 py-3 font-semibold text-apple-gray-600 whitespace-nowrap">
                  Total
                </th>
                <th className="text-left px-6 py-3 font-semibold text-apple-gray-600 whitespace-nowrap">
                  Paiement
                </th>
                <th className="text-left px-6 py-3 font-semibold text-apple-gray-600">
                  Statut
                </th>
                <th className="text-left px-6 py-3 font-semibold text-apple-gray-600 whitespace-nowrap">
                  Date
                </th>
                <th className="text-left px-6 py-3 font-semibold text-apple-gray-600 whitespace-nowrap">
                  Changer statut
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="text-center py-16 text-apple-gray-400"
                  >
                    Aucune commande trouvée
                  </td>
                </tr>
              ) : (
                filtered.map((order) => {
                  const style =
                    ORDER_STATUS_STYLE[order.status] ?? {
                      background: "#f3f4f6",
                      color: "#6b7280",
                    };
                  const isUpdating = isPending && updatingId === order.id;
                  const customerName = order.user?.name ?? "Invité";
                  const customerEmail =
                    order.user?.email ?? order.guestEmail ?? "—";

                  return (
                    <tr
                      key={order.id}
                      className="border-b border-apple-gray-100 last:border-0
                                 hover:bg-apple-gray-50 transition-colors"
                    >
                      {/* N° commande */}
                      <td className="px-6 py-4 font-mono text-xs font-semibold text-apple-blue whitespace-nowrap">
                        {order.orderNumber}
                      </td>

                      {/* Client */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="w-7 h-7 rounded-full bg-apple-gray-200 flex items-center
                                       justify-center text-xs font-bold text-apple-gray-600 shrink-0"
                          >
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-apple-gray-900 truncate max-w-[150px]">
                              {customerName}
                            </p>
                            <p className="text-xs text-apple-gray-400 truncate max-w-[150px]">
                              {customerEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Articles */}
                      <td className="px-6 py-4 text-center">
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs
                                     font-medium bg-apple-gray-100 text-apple-gray-700"
                        >
                          {order.itemCount}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="px-6 py-4 font-semibold text-apple-gray-900 whitespace-nowrap">
                        {formatXOF(order.total)}
                      </td>

                      {/* Paiement */}
                      <td className="px-6 py-4 text-apple-gray-600 text-xs whitespace-nowrap">
                        {PAYMENT_METHOD_LABEL[order.paymentMethod] ??
                          order.paymentMethod}
                      </td>

                      {/* Statut badge */}
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs
                                     font-semibold whitespace-nowrap"
                          style={style}
                        >
                          {ORDER_STATUS_LABEL[order.status] ?? order.status}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-apple-gray-500 text-xs whitespace-nowrap">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      {/* Changer statut */}
                      <td className="px-6 py-4">
                        <div className="relative inline-block">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              handleStatusChange(
                                order.id,
                                e.target.value as OrderStatus
                              )
                            }
                            disabled={isUpdating}
                            className="appearance-none pr-7 pl-3 py-1.5 text-xs rounded-apple-md
                                       border border-apple-gray-200 bg-white text-apple-gray-700
                                       focus:outline-none focus:ring-2 focus:ring-apple-blue/30
                                       focus:border-apple-blue transition-all disabled:opacity-50
                                       cursor-pointer"
                          >
                            {ALL_STATUSES.map((s) => (
                              <option key={s} value={s}>
                                {ORDER_STATUS_LABEL[s] ?? s}
                              </option>
                            ))}
                          </select>
                          <ChevronDown
                            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2
                                       w-3 h-3 text-apple-gray-400"
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
