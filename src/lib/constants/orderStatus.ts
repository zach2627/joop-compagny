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
  PENDING: { background: "rgba(234,179,8,0.15)", color: "#EAB308" },
  CONFIRMED: { background: "rgba(59,130,246,0.15)", color: "#60A5FA" },
  PROCESSING: { background: "rgba(168,85,247,0.15)", color: "#C084FC" },
  SHIPPED: { background: "rgba(99,102,241,0.15)", color: "#818CF8" },
  DELIVERED: { background: "rgba(34,197,94,0.15)", color: "#4ADE80" },
  CANCELLED: { background: "rgba(239,68,68,0.15)", color: "#F87171" },
  REFUNDED: { background: "rgba(107,114,128,0.15)", color: "#9CA3AF" },
};

/** Badge Tailwind class (admin UI) */
export const ORDER_STATUS_BADGE: Record<string, string> = {
  PENDING: "badge-yellow",
  CONFIRMED: "badge-blue",
  PROCESSING: "badge-blue",
  SHIPPED: "badge-blue",
  DELIVERED: "badge-green",
  CANCELLED: "badge-red",
  REFUNDED: "badge-gray",
};
