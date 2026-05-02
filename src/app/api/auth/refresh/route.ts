import { NextRequest, NextResponse } from "next/server";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/auth/jwt";
import { sanitizeRedirectPath } from "@/lib/auth/redirect";
import prisma from "@/lib/db/prisma";
import { logger } from "@/lib/middleware/logger";

const REFRESH_COOKIE = "st_refresh";
const SESSION_COOKIE = "st_session";

function wantsJsonResponse(request: NextRequest) {
  const accept = request.headers.get("accept") ?? "";

  return (
    request.headers.get("x-auth-intent") === "client-refresh" ||
    accept.includes("application/json")
  );
}

export async function GET(request: NextRequest) {
  const jsonResponse = wantsJsonResponse(request);
  const redirectTo = sanitizeRedirectPath(
    request.nextUrl.searchParams.get("redirect"),
    "/"
  );
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

  if (!refreshToken) {
    if (jsonResponse) {
      return NextResponse.json(
        { success: false, error: "Authentification requise" },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  try {
    await verifyRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken, isRevoked: false },
      include: {
        user: { select: { id: true, email: true, role: true, isActive: true } },
      },
    });

    if (!storedToken || !storedToken.user.isActive) {
      if (jsonResponse) {
        return NextResponse.json(
          { success: false, error: "Session invalide" },
          {
            status: 401,
            headers: {
              "Cache-Control": "no-store",
            },
          }
        );
      }

      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    const user = storedToken.user;

    const [newAccessToken, newRefreshToken] = await Promise.all([
      signAccessToken({ userId: user.id, email: user.email, role: user.role }),
      signRefreshToken({ userId: user.id, email: user.email, role: user.role }),
    ]);

    await prisma.$transaction([
      prisma.refreshToken.update({
        where: { token: refreshToken },
        data: { isRevoked: true },
      }),
      prisma.refreshToken.create({
        data: {
          userId: user.id,
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    const response = jsonResponse
      ? NextResponse.json(
          { success: true, redirectTo },
          {
            headers: {
              "Cache-Control": "no-store",
            },
          }
        )
      : NextResponse.redirect(new URL(redirectTo, request.url));

    response.cookies.set(SESSION_COOKIE, newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 15,
      path: "/",
    });

    response.cookies.set(REFRESH_COOKIE, newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    logger.info("auth.token.refreshed", { userId: user.id });
    return response;
  } catch (error) {
    logger.warn("auth.token.refresh-failed", { error: String(error) });

    if (jsonResponse) {
      return NextResponse.json(
        { success: false, error: "Session invalide" },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store",
          },
        }
      );
    }

    return NextResponse.redirect(new URL("/auth/login", request.url));
  }
}
