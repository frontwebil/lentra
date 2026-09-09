import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const websites = await prisma.website.findMany({
    where: {
      userId: session.user.id,
    },
  });

  return NextResponse.json({ websites }, { status: 200 });
}

