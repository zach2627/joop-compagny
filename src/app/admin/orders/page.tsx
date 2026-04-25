import { redirect } from "next/navigation";

export const metadata = { title: "Commandes — Admin" };

export default async function AdminOrdersPage() {
  redirect("/admin/commandes");
}
