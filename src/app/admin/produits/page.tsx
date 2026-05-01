import Image from "next/image";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { redirect } from "next/navigation";
import { ProductCreateForm } from "@/components/admin/ProductCreateForm";
import { ProductImagesManager } from "@/components/admin/ProductImagesManager";
import { formatXOF } from "@/features/payment/paydunya";
import { getServerSession } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";
import { siteConfig } from "@/config/site";

export const metadata = { title: "Produits - Admin" };
const STORE_CATEGORY_SLUGS = [...siteConfig.navCategories] as string[];

const panel = {
  background: "rgba(17,17,9,0.84)",
  border: "1px solid rgba(201,168,76,0.14)",
  borderRadius: "16px",
  overflow: "hidden" as const,
};

const thStyle = {
  padding: "12px 20px",
  fontSize: "11px",
  fontWeight: 600,
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: "rgba(255,255,255,0.46)",
  background: "rgba(201,168,76,0.06)",
  whiteSpace: "nowrap" as const,
};

export default async function AdminProduitsPage() {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) redirect("/auth/login");

  const [categories, products] = await Promise.all([
    prisma.category.findMany({
      where: { slug: { in: STORE_CATEGORY_SLUGS } },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: { id: true, name: true, slug: true, isActive: true },
    }),
    prisma.product.findMany({
      where: { category: { slug: { in: STORE_CATEGORY_SLUGS } } },
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        variants: {
          select: {
            id: true,
            price: true,
            stock: true,
            isDefault: true,
            stockStatus: true,
          },
        },
        _count: { select: { orderItems: true } },
      },
    }),
  ]);

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
          Produits
        </h1>
        <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
          Gere le catalogue, les variantes et les images Cloudinary.
        </p>
      </div>

      <section id="ajout-produit" className="space-y-4">
        <div>
          <h2 className="text-base font-semibold" style={{ color: "#fff" }}>Ajouter un produit</h2>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Le formulaire inclut les variantes et les premieres images.
          </p>
        </div>
        <ProductCreateForm categories={categories} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold" style={{ color: "#fff" }}>Catalogue</h2>
            <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
              {products.length} produit(s) enregistres.
            </p>
          </div>
          <a href="#ajout-produit" className="btn-primary px-5 py-2.5 text-sm">
            + Ajouter rapidement
          </a>
        </div>

        <div style={panel}>
          <table className="w-full text-sm">
            <thead>
              <tr>
                {["Produit", "Categorie", "Prix", "Variantes", "Stock", "Images", "Statut", ""].map((h) => (
                  <th key={h} style={thStyle}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const defaultVariant =
                  product.variants.find((v) => v.isDefault) ?? product.variants[0];
                const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                const lowStock = product.variants.filter(
                  (v) => v.stockStatus === "LOW_STOCK" || v.stockStatus === "OUT_OF_STOCK"
                ).length;
                const primaryImage =
                  product.images.find((img) => img.isPrimary) ?? product.images[0];

                return (
                  <tr
                    key={product.id}
                    className="transition-colors"
                    style={{ borderTop: "1px solid rgba(201,168,76,0.07)" }}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden"
                          style={{
                            borderRadius: "10px",
                            background: "rgba(255,255,255,0.05)",
                            border: "1px solid rgba(201,168,76,0.12)",
                          }}
                        >
                          {primaryImage ? (
                            <Image
                              src={primaryImage.url}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.3)" }}>IMG</span>
                          )}
                        </div>
                        <div>
                          <p className="max-w-[220px] truncate font-medium" style={{ color: "#fff" }}>
                            {product.name}
                          </p>
                          <p className="font-mono text-xs" style={{ color: "rgba(255,255,255,0.36)" }}>
                            {product.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {product.category.name}
                    </td>

                    <td className="px-5 py-4 font-semibold tabular-nums" style={{ color: "#C9A84C" }}>
                      {formatXOF(Number(defaultVariant?.price ?? product.basePrice))}
                    </td>

                    <td className="px-5 py-4 tabular-nums" style={{ color: "rgba(255,255,255,0.6)" }}>
                      {product.variants.length}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold tabular-nums" style={{ color: "#fff" }}>
                          {totalStock}
                        </span>
                        <span className={`badge ${lowStock > 0 ? "badge-yellow" : "badge-green"}`}>
                          {lowStock > 0 ? `${lowStock} a surveiller` : "OK"}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <ProductImagesManager
                        productId={product.id}
                        productSlug={product.slug}
                        images={product.images}
                      />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className={`badge ${product.isActive ? "badge-green" : "badge-gray"}`}>
                          {product.isActive ? "Actif" : "Inactif"}
                        </span>
                        <span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.36)" }}>
                          {product._count.orderItems} vente(s)
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/produits/${product.id}/modifier`}
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs transition-colors"
                        style={{
                          border: "1px solid rgba(201,168,76,0.2)",
                          color: "#C9A84C",
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                        Modifier
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {products.length === 0 && (
            <div className="p-12 text-center">
              <p style={{ color: "rgba(255,255,255,0.4)" }}>Aucun produit.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
