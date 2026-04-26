// src/app/admin/commandes/page.tsx
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/auth/jwt";
import prisma from "@/lib/db/prisma";
import CommandesClient from "./CommandesClient";

export const metadata = { title: "Commandes — Admin JOOP" };

export default async function AdminCommandesPage() {
  const session = await getServerSession();
  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    redirect("/auth/login");
  }

  const raw = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      user: { select: { name: true, email: true } },
      payment: { select: { status: true } },
      _count: { select: { items: true } },
    },
  });

  const orders = raw.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status as string,
    paymentStatus: o.paymentStatus as string,
    paymentMethod: o.paymentMethod as string,
    total: Number(o.total),
    guestEmail: o.guestEmail,
    createdAt: o.createdAt.toISOString(),
    user: o.user,
    payment: o.payment,
    itemCount: o._count.items,
  }));

  return <CommandesClient orders={orders} />;
}
