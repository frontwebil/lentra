import { redis } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const key = `password-recovery:${token}`;
  const email = await redis.get<string>(key);

  if (!email) {
    return NextResponse.json({ error: "Token not found" }, { status: 401 });
  }

  return NextResponse.json(
    {
      isValid: true,
    },
    { status: 200 },
  );
}
