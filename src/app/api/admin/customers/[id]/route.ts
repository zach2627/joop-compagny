// src/app/api/admin/customers/[id]/route.ts
import { getServerSession } from "@/lib/auth/jwt";
import { NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  await prisma.user.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
