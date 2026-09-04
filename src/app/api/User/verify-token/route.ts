import prisma from "@/lib/prisma";
import { redis } from "@/lib/rate-limit";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { token } = await req.json();
    if (!token) {
      return NextResponse.json(
        { message: "Verification Token not found" },
        { status: 404 },
      );
    }

    const key = `email-verification:${token}`;
    const email = await redis.get<string>(key);

    if (!email) {
      return NextResponse.json(
        { message: "VERIFICATION_TOKEN_INVALID" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: {
        email: String(email),
      },
    });

    if (!user) {
      return NextResponse.json({ message: "USER_NOT_FOUND" }, { status: 404 });
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isConfirmed: true,
      },
    });

    await redis.del(`email-verification:${token}`);

    return NextResponse.json({ message: "EMAIL_VERIFIED" }, { status: 200 });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 },
    );
  }
}
