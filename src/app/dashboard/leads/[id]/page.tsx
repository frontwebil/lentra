import { LeedsPage } from "@/Components/Dashboard/Leeds/LeedsPage/LeedsPage";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const website = await prisma.website.findUnique({
    where: {
      userId: session?.user.id,
      xSiteId: id,
    },
  });

  return {
    title: website?.websiteName ?? "Lentra CRM",
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;

  const website = await prisma.website.findUnique({
    where: {
      userId: session?.user.id,
      xSiteId: id,
    },
    include: {
      leads: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!website) {
    redirect("/dashboard/leads");
  }

  return <LeedsPage website={website} />;
}
