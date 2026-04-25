// src/components/admin/OrderStatusUpdater.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatusAction } from "@/features/orders/actions";

const STATUSES = [
  { value: "PENDING", label: "En attente" },
  { value: "CONFIRMED", label: "Confirmée" },
  { value: "PROCESSING", label: "En traitement" },
  { value: "SHIPPED", label: "Expédiée" },
  { value: "DELIVERED", label: "Livrée" },
  { value: "CANCELLED", label: "Annulée" },
  { value: "REFUNDED", label: "Remboursée" },
];

interface Props {
  orderId: string;
  currentStatus: string;
}

export function OrderStatusUpdater({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [appliedStatus, setAppliedStatus] = useState(currentStatus);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleUpdate = async () => {
    setLoading(true);
    setSuccess(false);
    setError("");
    const result = await updateOrderStatusAction({ orderId, status, comment });
    setLoading(false);
    if (result.success) {
      setAppliedStatus(status);
      setSuccess(true);
      setComment("");
      router.refresh();
      setTimeout(() => setSuccess(false), 3000);
    } else {
      setError(result.error ?? "Erreur");
    }
  };

  return (
    <div className="space-y-3">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        className="input text-sm w-full"
      >
        {STATUSES.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Commentaire (optionnel)..."
        rows={2}
        className="input text-sm w-full resize-none"
      />

      <button
        onClick={handleUpdate}
        disabled={loading || status === appliedStatus}
        className="btn-primary w-full py-2 text-sm disabled:opacity-50"
      >
        {loading ? "Mise à jour..." : "Mettre à jour"}
      </button>

      {success && (
        <p className="text-xs text-green-600 font-medium">✅ Statut mis à jour !</p>
      )}
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
