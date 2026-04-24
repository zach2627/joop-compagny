// @ts-nocheck
import "dotenv/config";
import { defineConfig } from "prisma/config";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.example to .env and fill in your database credentials."
  );
}

if (databaseUrl.includes("HOST") || databaseUrl.includes("USER:PASSWORD")) {
  throw new Error(
    `DATABASE_URL still contains placeholder values: "${databaseUrl}"\n` +
      "Replace HOST with your actual database server hostname or IP address."
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl,
  },
});
