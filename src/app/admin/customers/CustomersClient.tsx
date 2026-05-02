"use client";

// src/app/admin/customers/CustomersClient.tsx
import { useState } from "react";
import { Search, Trash2, Eye, Download, Users } from "lucide-react";

type Customer = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  createdAt: string;
  _count: { orders: number };
};

export default function CustomersClient({
  customers,
}: {
  customers: Customer[];
}) {
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [list, setList] = useState(customers);

  const filtered = list.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce client ?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/customers/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setList((prev) => prev.filter((c) => c.id !== id));
      } else {
        alert("Erreur lors de la suppression.");
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleExport = () => {
    const headers = ["Nom", "Email", "Téléphone", "Commandes", "Inscrit le"];
    const rows = filtered.map((c) => [
      c.name ?? "",
      c.email,
      c.phone ?? "",
      c._count.orders,
      new Date(c.createdAt).toLocaleDateString("fr-FR"),
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "clients.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.2)" }}
          >
            <Users className="w-5 h-5" style={{ color: "#C9A84C" }} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Clients</h1>
            <p className="text-sm" style={{ color: "rgba(255,255,255,0.46)" }}>
              {list.length} client{list.length > 1 ? "s" : ""} au total
            </p>
          </div>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors"
          style={{
            background: "rgba(201,168,76,0.08)",
            border: "1px solid rgba(201,168,76,0.2)",
            color: "#C9A84C",
          }}
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
          style={{ color: "rgba(255,255,255,0.3)" }}
        />
        <input
          type="text"
          placeholder="Rechercher par nom, email ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 transition-all"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(201,168,76,0.18)",
          }}
        />
      </div>

      {/* Table */}
      <div
        className="overflow-hidden"
        style={{
          background: "rgba(17,17,9,0.84)",
          border: "1px solid rgba(201,168,76,0.14)",
          borderRadius: "16px",
        }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ background: "rgba(201,168,76,0.06)", borderBottom: "1px solid rgba(201,168,76,0.1)" }}>
              <th className="text-left px-6 py-3 font-semibold" style={{ color: "rgba(255,255,255,0.46)" }}>Client</th>
              <th className="text-left px-6 py-3 font-semibold" style={{ color: "rgba(255,255,255,0.46)" }}>Email</th>
              <th className="text-left px-6 py-3 font-semibold" style={{ color: "rgba(255,255,255,0.46)" }}>Téléphone</th>
              <th className="text-left px-6 py-3 font-semibold" style={{ color: "rgba(255,255,255,0.46)" }}>Commandes</th>
              <th className="text-left px-6 py-3 font-semibold" style={{ color: "rgba(255,255,255,0.46)" }}>Inscrit le</th>
              <th className="text-right px-6 py-3 font-semibold" style={{ color: "rgba(255,255,255,0.46)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12" style={{ color: "rgba(255,255,255,0.3)" }}>
                  Aucun client trouvé
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="last:border-0 transition-colors"
                  style={{ borderBottom: "1px solid rgba(201,168,76,0.06)" }}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{
                          background: "rgba(201,168,76,0.18)",
                          border: "1px solid rgba(201,168,76,0.3)",
                          color: "#C9A84C",
                        }}
                      >
                        {c.name?.charAt(0).toUpperCase() ?? c.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">
                        {c.name ?? "Sans nom"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4" style={{ color: "rgba(255,255,255,0.6)" }}>{c.email}</td>
                  <td className="px-6 py-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {c.phone ?? <span style={{ color: "rgba(255,255,255,0.2)" }}>—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        background: "rgba(201,168,76,0.12)",
                        color: "#C9A84C",
                        border: "1px solid rgba(201,168,76,0.2)",
                      }}
                    >
                      {c._count.orders} commande{c._count.orders > 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-6 py-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/admin/customers/${c.id}`}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                        title="Voir le détail"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="p-1.5 rounded-lg transition-colors disabled:opacity-50"
                        style={{ color: "rgba(255,255,255,0.3)" }}
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
