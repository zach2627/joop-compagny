import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env") });

const prisma = new PrismaClient();
const ADMIN_EMAIL = "admin@joop-compagny.com";

async function main() {
  const newPassword = process.env.NEW_ADMIN_PASSWORD?.trim();

  if (!newPassword) {
    console.error("❌ NEW_ADMIN_PASSWORD est vide ou absent du .env");
    process.exit(1);
  }

  if (newPassword.length < 8) {
    console.error("❌ NEW_ADMIN_PASSWORD doit faire au moins 8 caractères");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
    select: { id: true, email: true, role: true, isActive: true, name: true },
  });

  if (!user) {
    console.error(`❌ Aucun utilisateur trouvé pour ${ADMIN_EMAIL}`);
    process.exit(1);
  }

  console.log(`✓ Utilisateur trouvé : ${user.name ?? user.email} (${user.role})`);

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, isActive: true },
  });

  console.log(`✓ Mot de passe mis à jour pour ${ADMIN_EMAIL}`);
  console.log("  Vous pouvez maintenant vous connecter avec le nouveau mot de passe.");
}

main()
  .catch((err) => {
    console.error("❌ Erreur :", err instanceof Error ? err.message : err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
