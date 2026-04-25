import { redirect } from "next/navigation";

export const metadata = { title: "Nouveau produit — Admin" };

export default async function NewProductPage() {
  redirect("/admin/produits");
}
