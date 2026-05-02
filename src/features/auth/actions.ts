// src/features/auth/actions.ts
"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { cookies, headers } from "next/headers";
import prisma from "@/lib/db/prisma";
import {
  signAccessToken,
  signRefreshToken,
  setAuthCookies,
  clearAuthCookies,
  REFRESH_COOKIE,
  getServerSession,
} from "@/lib/auth/jwt";
import {
  changePasswordSchema,
  loginSchema,
  registerSchema,
} from "@/lib/validation/schemas";
import { authLimiter } from "@/lib/middleware/logger";
import { logger } from "@/lib/middleware/logger";

function getClientIP(): string {
  const headersList = headers();
  return (
    headersList.get("x-forwarded-for")?.split(",")[0] ||
    headersList.get("x-real-ip") ||
    "unknown"
  );
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// ─── Register ─────────────────────────────────────────────────────────────────

export async function registerAction(
  formData: FormData
): Promise<ActionResult<{ userId: string }>> {
  const ip = getClientIP();
  const rl = authLimiter(ip);
  if (!rl.success) {
    return { success: false, error: "Trop de tentatives. Réessayez plus tard." };
  }

  const raw = Object.fromEntries(formData);
  const parsed = registerSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      success: false,
      error: "Données invalides",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { name, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { success: false, error: "Un compte avec cet email existe déjà." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, phone, passwordHash },
  });

  logger.info("user.register", { userId: user.id, email });

  // Auto-login after register
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ userId: user.id, email, role: user.role }),
    signRefreshToken({ userId: user.id, email, role: user.role }),
  ]);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  setAuthCookies(accessToken, refreshToken);

  return { success: true, data: { userId: user.id } };
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginAction(
  formData: FormData
): Promise<ActionResult<{ userId: string; role: string }>> {

  const ip = getClientIP();
  const rl = authLimiter(ip);
  if (!rl.success) {
    return { success: false, error: "Trop de tentatives. Réessayez dans 15 minutes." };
  }

  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { success: false, error: "Email ou mot de passe invalide" };
  }

  const email = parsed.data.email.toLowerCase();
  const password = parsed.data.password;

  const user = await prisma.user.findFirst({
    where: { email, isActive: true }
  });

  const passwordHash =
    user?.passwordHash ??
    "$2a$12$invalidhashinvalidhashinvalidhashinvalidha";

  const isValid = await bcrypt.compare(password, passwordHash);

  if (!user || !isValid) {
    logger.warn("auth.login.failed", { email, ip });
    return { success: false, error: "Email ou mot de passe incorrect." };
  }

  await prisma.refreshToken.deleteMany({
    where: { userId: user.id }
  });

  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ userId: user.id, email, role: user.role }),
    signRefreshToken({ userId: user.id, email, role: user.role }),
  ]);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  setAuthCookies(accessToken, refreshToken);

  logger.info("auth.login.success", { userId: user.id, role: user.role });

  return { success: true, data: { userId: user.id, role: user.role } };
}

export async function changePasswordAction(
  formData: FormData
): Promise<ActionResult> {
  const session = await getServerSession();

  if (!session || !["ADMIN", "STAFF"].includes(session.role)) {
    return {
      success: false,
      error: "Session expiree. Reconnectez-vous pour changer le mot de passe.",
    };
  }

  const parsed = changePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      success: false,
      error: "Verifie les champs du formulaire.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      email: true,
      role: true,
      isActive: true,
      passwordHash: true,
    },
  });

  if (!user || !user.isActive) {
    return {
      success: false,
      error: "Compte introuvable ou inactif.",
    };
  }

  const passwordHash =
    user.passwordHash ??
    "$2a$12$invalidhashinvalidhashinvalidhashinvalidha";

  const currentPasswordIsValid = await bcrypt.compare(
    currentPassword,
    passwordHash
  );

  if (!currentPasswordIsValid) {
    logger.warn("auth.password-change.failed", {
      userId: user.id,
      reason: "invalid-current-password",
    });

    return {
      success: false,
      error: "Le mot de passe actuel est incorrect.",
    };
  }

  const nextPasswordHash = await bcrypt.hash(newPassword, 12);
  const [accessToken, refreshToken] = await Promise.all([
    signAccessToken({ userId: user.id, email: user.email, role: user.role }),
    signRefreshToken({ userId: user.id, email: user.email, role: user.role }),
  ]);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: nextPasswordHash },
    }),
    prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    }),
    prisma.session.deleteMany({
      where: { userId: user.id },
    }),
    prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    }),
  ]);

  setAuthCookies(accessToken, refreshToken);
  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/password");

  logger.info("auth.password-change.success", {
    userId: user.id,
    role: user.role,
  });

  return { success: true, data: undefined };
}

// ─── Logout ───────────────────────────────────────────────────────────────────

export async function logoutAction(): Promise<void> {
  const refreshToken = cookies().get(REFRESH_COOKIE)?.value;

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

  clearAuthCookies();
  redirect("/");
}
