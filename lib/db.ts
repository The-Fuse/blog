import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Supabase (and most hosted Postgres) present a certificate chain that Node does not trust by default,
 * so `sslmode=require` fails with "self-signed certificate in certificate chain". Encrypt the connection
 * but skip chain verification, which is what `uselibpqcompat=true&sslmode=require` does in the pg driver.
 */
function poolConfig(connectionString: string) {
  let url: URL | null = null;
  try {
    url = new URL(connectionString);
  } catch {}
  const sslmode = url?.searchParams.get("sslmode");
  const wantsTls = Boolean(sslmode && sslmode !== "disable") || Boolean(url?.hostname.endsWith("supabase.co") || url?.hostname.endsWith("supabase.com"));
  // Small pool and short timeouts: serverless functions and build workers each get their own pool,
  // so a large default would exhaust the database's connection limit and hang instead of failing.
  const base = { max: 3, connectionTimeoutMillis: 10_000, idleTimeoutMillis: 10_000 };
  if (!wantsTls || !url) return { connectionString, ...base };
  url.searchParams.delete("sslmode");
  url.searchParams.delete("uselibpqcompat");
  return { connectionString: url.toString(), ssl: { rejectUnauthorized: false }, ...base };
}

function createPrisma() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not set");
  return new PrismaClient({ adapter: new PrismaPg(poolConfig(connectionString)) });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
