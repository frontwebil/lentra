import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  const { leadId } = await req.json();

  console.log(leadId);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (!leadId) {
    return NextResponse.json({ message: "leadId not found" }, { status: 400 });
  }

  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
      userId: session.user.id,
    },
  });

  if (!lead) {
    return NextResponse.json({ message: "Lead not found" }, { status: 404 });
  }

  await prisma.lead.delete({
    where: {
      id: lead.id,
      userId: session.user.id,
    },
  });

  return NextResponse.json(
    { message: "Lead deleted successfully" },
    { status: 200 },
  );
}
