import { redirect } from "next/navigation";

export const metadata = { title: "Produits — Admin" };

export default async function AdminProductsPage() {
  redirect("/admin/produits");
}
