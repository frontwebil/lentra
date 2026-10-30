import { LeadPage } from "@/Components/Dashboard/Leeds/LeadPage/LeadPage";
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

  if (!session) {
    redirect("/login");
  }

  const lead = await prisma.lead.findFirst({
    where: {
      userId: session?.user.id,
      id,
    },
    include: { client: { select: { id: true, name: true, phone: true } } },
  });

  const website = await prisma.website.findFirst({
    where: {
      userId: session?.user.id,
      id: lead?.websiteId,
    },
  });

  if (!website) {
    redirect("/dashboard/leads");
  }

  if (!lead) {
    redirect("/dashboard/leads");
  }

  return <LeadPage lead={lead} website={website} client={lead.client} />;
}
