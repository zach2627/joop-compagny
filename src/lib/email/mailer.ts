import nodemailer from "nodemailer";
import { siteConfig } from "@/config/site";

const SENDER = process.env.SMTP_FROM ?? siteConfig.email;

function createTransporter() {
  if (!process.env.SMTP_PASS) {
    throw new Error(
      "SMTP_PASS is not set. Add it to your .env file.\n" +
        "Generate a Gmail App Password at: https://myaccount.google.com/apppasswords"
    );
  }
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: SENDER,
      pass: process.env.SMTP_PASS,
    },
  });
}

export async function verifySmtpConnection(): Promise<void> {
  const transporter = createTransporter();
  await transporter.verify();
}

export async function sendPasswordResetEmail(
  to: string,
  resetLink: string
): Promise<void> {
  const transporter = createTransporter();

  const html = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><title>Reinitialisation de mot de passe</title></head>
<body style="background:#110915;font-family:'Segoe UI',Arial,sans-serif;margin:0;padding:40px 20px;">
  <div style="max-width:520px;margin:0 auto;background:#1a0f21;border:1px solid rgba(246,198,104,0.24);border-radius:18px;overflow:hidden;">
    <div style="background:radial-gradient(circle at top left, rgba(243,111,69,0.35), transparent 40%), linear-gradient(135deg,#120816 0%,#241129 100%);padding:40px 40px 32px;text-align:center;border-bottom:1px solid rgba(246,198,104,0.12);">
      <div style="display:inline-flex;align-items:center;justify-content:center;width:58px;height:58px;background:rgba(246,198,104,0.12);border:1px solid rgba(246,198,104,0.4);border-radius:50%;margin-bottom:20px;font-size:24px;">JO</div>
      <h1 style="color:#FFFFFF;font-size:22px;font-weight:700;margin:0 0 8px;letter-spacing:-0.3px;">Reinitialisation du mot de passe</h1>
      <p style="color:#d4a8c4;font-size:14px;margin:0;">${siteConfig.name}</p>
    </div>
    <div style="padding:36px 40px;">
      <p style="color:#f8eef4;font-size:15px;line-height:1.7;margin:0 0 20px;">Bonjour,</p>
      <p style="color:#f8eef4;font-size:15px;line-height:1.7;margin:0 0 28px;">
        Vous avez demande a reinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour en creer un nouveau. Ce lien est valide pendant <strong style="color:#f6c668;">1 heure</strong>.
      </p>
      <div style="text-align:center;margin:32px 0;">
        <a href="${resetLink}"
           style="display:inline-block;background:linear-gradient(135deg,#f6c668 0%,#ff8b5d 100%);color:#180c1f;text-decoration:none;padding:15px 36px;border-radius:100px;font-weight:700;font-size:15px;letter-spacing:0.1px;">
          Reinitialiser mon mot de passe
        </a>
      </div>
      <p style="color:#c79bb8;font-size:13px;line-height:1.6;margin:28px 0 0;">
        Si vous n'avez pas fait cette demande, ignorez cet email et votre mot de passe restera inchange.
      </p>
      <p style="color:#a67a9b;font-size:12px;line-height:1.6;margin:16px 0 0;word-break:break-all;">
        Ou copiez ce lien dans votre navigateur :<br>
        <span style="color:#f6c668;">${resetLink}</span>
      </p>
    </div>
    <div style="padding:20px 40px;border-top:1px solid rgba(246,198,104,0.12);text-align:center;">
      <p style="color:#a67a9b;font-size:12px;margin:0;">${siteConfig.name} · ${siteConfig.address}</p>
    </div>
  </div>
</body>
</html>`;

  const text = [
    `Reinitialisation de mot de passe - ${siteConfig.name}`,
    "",
    "Vous avez demande a reinitialiser votre mot de passe.",
    "",
    "Lien de reinitialisation (valide 1h) :",
    resetLink,
    "",
    "Si vous n'avez pas fait cette demande, ignorez cet email.",
  ].join("\n");

  await transporter.sendMail({
    from: `"${siteConfig.name}" <${SENDER}>`,
    to,
    subject: `Reinitialisation de votre mot de passe - ${siteConfig.name}`,
    html,
    text,
  });
}
