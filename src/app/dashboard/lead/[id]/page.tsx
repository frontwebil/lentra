import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function Page({ params }: Props) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const lead = await prisma.lead.findFirst({
    where: {
      userId: session?.user.id,
      id,
    },
  });

  const website = await prisma.website.findFirst({
    where: {
      userId: session?.user.id,
      id: lead?.websiteId,
    },
  });

  console.log(website?.leadSchema)

  if (!lead) {
    redirect("/dashboard/leads");
  }

  console.log(lead);

  return <div>Lead ID: {id}</div>;
}
