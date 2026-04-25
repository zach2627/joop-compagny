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
          <div className="w-10 h-10 rounded-apple-md bg-apple-blue/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-apple-blue" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-apple-gray-900">Clients</h1>
            <p className="text-sm text-apple-gray-500">
              {list.length} client{list.length > 1 ? "s" : ""} au total
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

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-apple-gray-400" />
        <input
          type="text"
          placeholder="Rechercher par nom, email ou téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-apple-md border border-apple-gray-200
                     text-sm bg-white focus:outline-none focus:ring-2 focus:ring-apple-blue/30
                     focus:border-apple-blue transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-apple-lg border border-apple-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-apple-gray-100 bg-apple-gray-50">
              <th className="text-left px-6 py-3 font-semibold text-apple-gray-600">Client</th>
              <th className="text-left px-6 py-3 font-semibold text-apple-gray-600">Email</th>
              <th className="text-left px-6 py-3 font-semibold text-apple-gray-600">Téléphone</th>
              <th className="text-left px-6 py-3 font-semibold text-apple-gray-600">Commandes</th>
              <th className="text-left px-6 py-3 font-semibold text-apple-gray-600">Inscrit le</th>
              <th className="text-right px-6 py-3 font-semibold text-apple-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-apple-gray-400">
                  Aucun client trouvé
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-apple-gray-100 last:border-0 hover:bg-apple-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-apple-blue flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name?.charAt(0).toUpperCase() ?? c.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-apple-gray-900">
                        {c.name ?? "Sans nom"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-apple-gray-600">{c.email}</td>
                  <td className="px-6 py-4 text-apple-gray-600">
                    {c.phone ?? <span className="text-apple-gray-300">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-apple-blue/10 text-apple-blue">
                      {c._count.orders} commande{c._count.orders > 1 ? "s" : ""}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-apple-gray-600">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={`/admin/customers/${c.id}`}
                        className="p-1.5 rounded-apple-sm text-apple-gray-400 hover:text-apple-blue hover:bg-apple-blue/10 transition-colors"
                        title="Voir le détail"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(c.id)}
                        disabled={deletingId === c.id}
                        className="p-1.5 rounded-apple-sm text-apple-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
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
