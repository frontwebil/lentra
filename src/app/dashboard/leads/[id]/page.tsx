import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { getServerSession } from "next-auth";

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

  const { id } = await params;

  const website = await prisma.website.findUnique({
    where: {
      userId: session?.user.id,
      xSiteId: id,
    },
    include: {
      leads: true,
    },
  });

  console.log(website?.leads);

  return (
    <div>
      {website?.leads.map((website) => (
        <p>{website.fields.name}</p>
      ))}
    </div>
  );
}
