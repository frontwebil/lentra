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
        select: {
          id: true,
        },
      },
    },
  });

  const result = await Promise.all(
    websites.map(async (website) => {
      const latestLead = await prisma.lead.findFirst({
        where: {
          websiteId: website.id,
          userId: session.user.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          createdAt: true,
        },
      });

      return {
        ...website,
        totalLeads: website._count.leads,
        newLeads: website.leads.length,
        latestLeadAt: latestLead?.createdAt ?? null,
        leads: undefined,
      };
    }),
  );

  return NextResponse.json({ websites: result }, { status: 200 });
}
