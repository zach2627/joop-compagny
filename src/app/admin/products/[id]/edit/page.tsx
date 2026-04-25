import { redirect } from "next/navigation";
import type { Metadata } from "next";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Redirection produit — Admin" };
}

export default async function EditProductPage({ params }: PageProps) {
  redirect(`/admin/produits/${params.id}/modifier`);
}
