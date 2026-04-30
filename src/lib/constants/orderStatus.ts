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
  PENDING: { background: "rgba(201,168,76,0.12)", color: "#E8C97A" },
  CONFIRMED: { background: "rgba(201,168,76,0.14)", color: "#E8C97A" },
  PROCESSING: { background: "rgba(201,168,76,0.12)", color: "#E8C97A" },
  SHIPPED: { background: "rgba(201,168,76,0.12)", color: "#E8C97A" },
  DELIVERED: { background: "rgba(201,168,76,0.14)", color: "#E8C97A" },
  CANCELLED: { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.72)" },
  REFUNDED: { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.72)" },
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
