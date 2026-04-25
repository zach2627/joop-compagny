/**
 * Test Nodemailer SMTP - JOOP COMPAGNY
 * Usage: npm run test:mailer
 */
import { readFileSync } from "fs";
import { resolve } from "path";
import nodemailer from "nodemailer";

let envLoaded = false;
try {
  const envPath = resolve(process.cwd(), ".env");
  const raw = readFileSync(envPath, "utf8");
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    let val = trimmed.slice(eqIdx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key) process.env[key] = val;
  }
  envLoaded = true;
} catch {
  // .env not found
}

const SENDER = process.env.SMTP_FROM || "contact@joop-compagny.com";
const TEST_LINK = "http://localhost:3000/auth/reset-password?token=test-token-abc123xyz";

async function main() {
  console.log("\nSMTP test - JOOP COMPAGNY\n");
  console.log(`.env loaded: ${envLoaded ? "yes" : "no"}\n`);

  const smtpPass = process.env.SMTP_PASS;
  if (!smtpPass) {
    console.error("SMTP_PASS missing in .env\n");
    process.exit(1);
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: { user: SENDER, pass: smtpPass },
  });

  process.stdout.write("1/2 Verify SMTP... ");
  await transporter.verify();
  console.log("OK");

  process.stdout.write(`2/2 Send test email to ${SENDER}... `);
  const info = await transporter.sendMail({
    from: `"JOOP COMPAGNY" <${SENDER}>`,
    to: SENDER,
    subject: "[TEST] Password reset",
    html: `<p style="font-family:sans-serif">Test OK. Link: <a href="${TEST_LINK}">${TEST_LINK}</a></p>`,
    text: `Test OK.\nLink: ${TEST_LINK}`,
  });
  console.log(`OK (${info.messageId})`);

  console.log("\nNodemailer is configured correctly.\n");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
