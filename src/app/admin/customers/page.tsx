// src/app/admin/customers/page.tsx
import { getServerSession } from "@/lib/auth/jwt";
import { redirect } from "next/navigation";
import prisma from "@/lib/db/prisma";
import CustomersClient from "./CustomersClient";

export default async function CustomersPage() {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    redirect("/auth/login");
  }

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: {
        select: { orders: true },
      },
    },
  });

  const serialized = customers.map((c) => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
  }));

  return <CustomersClient customers={serialized} />;
}
