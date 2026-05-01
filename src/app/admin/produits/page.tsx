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
        <h1 className="text-2xl font-bold text-apple-gray-900">Produits</h1>
        <p className="mt-1 text-apple-gray-500">
          Gere le catalogue, les variantes et les images Cloudinary.
        </p>
      </div>

      <section id="ajout-produit" className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-apple-gray-900">Ajouter un produit</h2>
          <p className="mt-1 text-sm text-apple-gray-500">
            Le formulaire inclut les variantes et les premieres images.
          </p>
        </div>
        <ProductCreateForm categories={categories} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-apple-gray-900">Catalogue</h2>
            <p className="mt-1 text-sm text-apple-gray-500">
              {products.length} produit(s) enregistres.
            </p>
          </div>
          <a href="#ajout-produit" className="btn-primary px-5 py-2.5 text-sm">
            + Ajouter rapidement
          </a>
        </div>

        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-apple-gray-50 text-left">
                {[
                  "Produit",
                  "Categorie",
                  "Prix",
                  "Variantes",
                  "Stock",
                  "Images",
                  "Statut",
                  "",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-5 py-3 text-xs font-medium uppercase tracking-wider text-apple-gray-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-apple-gray-100">
              {products.map((product) => {
                const defaultVariant =
                  product.variants.find((variant) => variant.isDefault) ?? product.variants[0];
                const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
                const lowStock = product.variants.filter(
                  (variant) =>
                    variant.stockStatus === "LOW_STOCK" ||
                    variant.stockStatus === "OUT_OF_STOCK"
                ).length;
                const primaryImage =
                  product.images.find((image) => image.isPrimary) ?? product.images[0];

                return (
                  <tr key={product.id} className="transition-colors hover:bg-apple-gray-50">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-apple-md bg-apple-gray-100">
                          {primaryImage ? (
                            <Image
                              src={primaryImage.url}
                              alt={product.name}
                              width={48}
                              height={48}
                              className="h-full w-full object-contain p-1"
                            />
                          ) : (
                            <span className="text-xs font-semibold text-apple-gray-400">IMG</span>
                          )}
                        </div>
                        <div>
                          <p className="max-w-[220px] truncate font-medium text-apple-gray-900">
                            {product.name}
                          </p>
                          <p className="font-mono text-xs text-apple-gray-400">{product.slug}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-apple-gray-600">{product.category.name}</td>

                    <td className="px-5 py-4 font-semibold text-apple-gray-900 tabular-nums">
                      {formatXOF(Number(defaultVariant?.price ?? product.basePrice))}
                    </td>

                    <td className="px-5 py-4 text-apple-gray-600 tabular-nums">
                      {product.variants.length}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold text-apple-gray-900 tabular-nums">
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
                        <span className="text-xs text-apple-gray-400 tabular-nums">
                          {product._count.orderItems} vente(s)
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/produits/${product.id}/modifier`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-apple-gray-200 px-3 py-1.5 text-xs text-apple-gray-600 transition-colors hover:border-apple-blue hover:text-apple-blue"
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
              <p className="text-apple-gray-400">Aucun produit.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
