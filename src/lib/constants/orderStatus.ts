// src/lib/constants/orderStatus.ts

export const ORDER_STATUS_LABEL: Record<string, string> = {
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  PROCESSING: "En traitement",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export const ORDER_STATUS_STYLE: Record<string, { background: string; color: string }> = {
  PENDING: { background: "rgba(201,168,76,0.12)", color: "#C9A84C" },
  CONFIRMED: { background: "rgba(201,168,76,0.16)", color: "#C9A84C" },
  PROCESSING: { background: "rgba(201,168,76,0.14)", color: "#C9A84C" },
  SHIPPED: { background: "rgba(201,168,76,0.14)", color: "#C9A84C" },
  DELIVERED: { background: "rgba(201,168,76,0.16)", color: "#C9A84C" },
  CANCELLED: { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" },
  REFUNDED: { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)" },
};

/** Badge Tailwind class (admin UI) */
export const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-yellow",
  CONFIRMED: "badge-blue",
  PROCESSING: "badge-blue",
  SHIPPED: "badge-blue",
  DELIVERED: "badge-green",
  CANCELLED: "badge-gray",
  REFUNDED: "badge-gray",
};
