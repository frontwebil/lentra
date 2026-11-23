import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Extracts the postgres:// URL from DATABASE_URL even when the hosting
// dashboard value was pasted with extras around it: quotes from .env,
// a `DATABASE_URL=` prefix, or Neon's `psql '...'` snippet. pg parses a
// non-absolute string relative to `postgres://base`, which shows up as
// "Can't reach database server at base".
function resolveConnectionString(raw: string | undefined) {
  if (!raw) {
    console.error("[prisma] DATABASE_URL is not set");
    return undefined;
  }

  const match = raw.match(/postgres(?:ql)?:\/\/[^\s"'`]+/);

  if (!match) {
    console.error(
      `[prisma] DATABASE_URL does not contain a postgres:// URL (length ${raw.length})`,
    );
    return raw;
  }

  const prefix = raw.slice(0, match.index).trim();

  if (prefix) {
    console.warn(
      `[prisma] Ignoring ${JSON.stringify(prefix)} before the URL in DATABASE_URL; fix the env var value`,
    );
  }

  // pg 8 already treats sslmode=prefer/require/verify-ca as verify-full but
  // warns about it; pin verify-full explicitly so behavior is stable in pg 9.
  return match[0].replace(
    /([?&]sslmode=)(prefer|require|verify-ca)\b/,
    "$1verify-full",
  );
}

const adapter = new PrismaPg({
  connectionString: resolveConnectionString(process.env.DATABASE_URL),
});

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
