import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const websites = await prisma.website.findMany({
    where: { userId: session.user.id },
    select: {
      id: true, websiteName: true, websiteUrl: true, xSiteId: true,
      leadSchema: true, statuses: true,
      leads: { orderBy: { createdAt: "asc" } },
    },
  });

  return NextResponse.json({ websites });
}
