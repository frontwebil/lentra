import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// pg 8 already treats sslmode=prefer/require/verify-ca as verify-full but warns
// about it; pin verify-full explicitly so behavior is stable across pg 9.
const connectionString = process.env.DATABASE_URL?.replace(
  /([?&]sslmode=)(prefer|require|verify-ca)\b/,
  "$1verify-full",
);

const adapter = new PrismaPg({ connectionString });

const prisma = new PrismaClient({
  adapter,
});

export default prisma;
