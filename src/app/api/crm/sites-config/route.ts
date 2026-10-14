import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const websites = await prisma.website.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      _count: {
        select: {
          leads: true,
        },
      },
      leads: {
        where: {
          isNew: true,
        },
      },
    },
  });

  const result = websites.map((website) => ({
    ...website,
    totalLeads: website._count.leads,
    newLeads: website.leads.length,
    leads: undefined,
  }));

  return NextResponse.json({ websites: result }, { status: 200 });
}
