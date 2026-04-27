import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import prisma from "@/lib/db/prisma";
import { sendPasswordResetEmail } from "@/lib/email/mailer";
import { logger, authLimiter } from "@/lib/middleware/logger";

const GENERIC_ERROR = "Impossible de traiter la demande pour le moment.";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function genericServerError() {
  return NextResponse.json({ error: GENERIC_ERROR }, { status: 500 });
}

export async function POST(req: NextRequest) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0] ??
    req.headers.get("x-real-ip") ??
    "unknown";
  const rl = authLimiter(ip);
  if (!rl.success) {
    return NextResponse.json(
      { error: "Trop de tentatives. Réessayez plus tard." },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Email invalide" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.isActive) {
      return NextResponse.json({ success: true });
    }

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { token, userId: user.id, expiresAt },
    });

    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ??
      process.env.NEXT_PUBLIC_APP_URL ??
      "https://www.joop-compagny.com";
    const resetLink = `${baseUrl}/auth/reset-password?token=${token}`;

    await sendPasswordResetEmail(email, resetLink);

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error("auth.forgot-password.failed", { error: String(error) });
    return genericServerError();
  }
}
