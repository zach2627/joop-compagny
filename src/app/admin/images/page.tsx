// src/app/admin/images/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";
import { ImageStation } from "@/components/admin/ImageStation";

export const metadata = { title: "Photos produits — Admin" };

export default async function AdminImagesPage() {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) redirect("/auth/login");

  const raw = await prisma.product.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      images: {
        orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }],
        select: { id: true, url: true, alt: true, color: true, isPrimary: true, sortOrder: true },
      },
      variants: {
        where: { color: { not: null } },
        select: { color: true },
        distinct: ["color"],
      },
    },
  });

  const products = raw.map(({ variants, ...p }) => ({
    ...p,
    variantColors: variants.map((v) => v.color!),
  }));

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-apple-gray-900">Photos produits</h1>
        <p className="mt-1 text-apple-gray-500">
          Sélectionnez un produit et uploadez ses photos vers Cloudinary (preset{" "}
          <span className="font-mono text-apple-gray-700">joop_compagny</span>).
        </p>
      </div>
      <ImageStation products={products} />
    </div>
  );
}
