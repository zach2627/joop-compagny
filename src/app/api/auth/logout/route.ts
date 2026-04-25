import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db/prisma";
import { REFRESH_COOKIE, SESSION_COOKIE } from "@/lib/auth/jwt";
import { logger } from "@/lib/middleware/logger";

function clearCookie(response: NextResponse, name: string) {
  response.cookies.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
}

export async function POST(request: NextRequest) {
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (refreshToken) {
    try {
      await prisma.refreshToken.updateMany({
        where: { token: refreshToken, isRevoked: false },
        data: { isRevoked: true },
      });
    } catch (error) {
      logger.warn("auth.logout.refresh-revoke-failed", { error: String(error) });
    }
  }

  const response = NextResponse.json({ success: true });
  clearCookie(response, SESSION_COOKIE);
  clearCookie(response, REFRESH_COOKIE);

  return response;
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405, headers: { Allow: "POST" } }
  );
}
