import "dotenv/config";
import { defineConfig } from "prisma/config";

// Migrations need a direct (or session-mode) Postgres connection. The transaction-mode pooler
// (port 6543) the app uses at runtime cannot run them, so `prisma migrate deploy` is not part of
// the Vercel build. Run `npm run db:deploy:prod` from a machine that has SUPABASE_DATABASE_URL
// (the direct connection) in .env.
const url = process.env.PRISMA_TARGET === "prod" ? process.env.SUPABASE_DATABASE_URL : process.env.DATABASE_URL;
if (!url) throw new Error(process.env.PRISMA_TARGET === "prod" ? "SUPABASE_DATABASE_URL is not set" : "DATABASE_URL is not set");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: { url },
});
