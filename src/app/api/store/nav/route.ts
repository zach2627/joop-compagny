import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/jwt";
import { getCartData } from "@/features/cart/actions";

export const dynamic = "force-dynamic";

export async function GET() {
  const [session, cartData] = await Promise.all([
    getServerSession(),
    getCartData(),
  ]);

  return NextResponse.json(
    {
      session: session
        ? {
            id: session.id,
            name: session.name,
            role: session.role,
          }
        : null,
      itemCount: cartData.itemCount,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
