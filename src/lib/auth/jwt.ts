// src/lib/auth/jwt.ts
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  type: "access" | "refresh";
}

function getSecret(envVar: string, fallback: string): Uint8Array {
  const value = process.env[envVar];
  if (!value) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(`[auth] Variable d'environnement manquante : ${envVar}`);
    }
    console.warn(`⚠️  [auth] ${envVar} non défini — fallback dev utilisé (JAMAIS en production)`);
    return new TextEncoder().encode(fallback);
  }
  return new TextEncoder().encode(value);
}

function getAccessSecret() {
  return getSecret(
    "JWT_ACCESS_SECRET",
    "fallback-dev-secret-min-64-chars-xxxxxxxxxxxxxxxx"
  );
}

function getRefreshSecret() {
  return getSecret(
    "JWT_REFRESH_SECRET",
    "fallback-dev-refresh-secret-min-64-chars-xxxxxxxx"
  );
}

export async function signAccessToken(payload: Omit<TokenPayload, "type">) {
  return new SignJWT({ ...payload, type: "access" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_ACCESS_EXPIRES_IN ?? "15m")
    .sign(getAccessSecret());
}

export async function signRefreshToken(payload: Omit<TokenPayload, "type">) {
  return new SignJWT({ ...payload, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_REFRESH_EXPIRES_IN ?? "30d")
    .sign(getRefreshSecret());
}

export async function verifyAccessToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getAccessSecret());
  return payload as TokenPayload;
}

export async function verifyRefreshToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, getRefreshSecret());
  return payload as TokenPayload;
}

// src/lib/auth/session.ts
import { cookies } from "next/headers";
import prisma from "@/lib/db/prisma";

export const SESSION_COOKIE = "st_session";
export const REFRESH_COOKIE = "st_refresh";

export async function getServerSession() {
  const cookieStore = cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const payload = await verifyAccessToken(token);
    const user = await prisma.user.findFirst({
      where: { id: payload.userId, isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        phone: true,
      },
    });
    return user;
  } catch {
    return null;
  }
}

export function setAuthCookies(accessToken: string, refreshToken: string) {
  const cookieStore = cookies();

  cookieStore.set(SESSION_COOKIE, accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 15, // 15 minutes
    path: "/",
  });

  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: "/",
  });
}

export function clearAuthCookies() {
  const cookieStore = cookies();
  cookieStore.delete(SESSION_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}
