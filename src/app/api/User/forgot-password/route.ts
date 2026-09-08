import { sendPasswordRecoveryEmail } from "@/lib/nodemailer";
import prisma from "@/lib/prisma";
import { redis } from "@/lib/rate-limit";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  const { email } = await req.json();
  const normalizedEmail = email.trim().toLowerCase();

  const existUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existUser) {
    const token = randomBytes(32).toString("hex");
    const key = `password-recovery:${token}`;

    await redis.set(key, normalizedEmail, {
      ex: 600,
    });

    await sendPasswordRecoveryEmail(normalizedEmail, token, existUser.language);
  }

  return new Response(null, { status: 204 });
}
