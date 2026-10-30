import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const leadId = typeof body?.leadId === "string" ? body.leadId : "";
  const clientId = typeof body?.clientId === "string" ? body.clientId : "";
  if (!leadId || !clientId) {
    return NextResponse.json({ message: "Lead and client are required" }, { status: 400 });
  }

  const [lead, client] = await Promise.all([
    prisma.lead.findFirst({ where: { id: leadId, userId: session.user.id } }),
    prisma.client.findFirst({ where: { id: clientId, userId: session.user.id }, select: { id: true } }),
  ]);
  if (!lead) return NextResponse.json({ message: "Lead not found" }, { status: 404 });
  if (!client) return NextResponse.json({ message: "Client not found" }, { status: 404 });

  await prisma.lead.update({ where: { id: lead.id }, data: { clientId: client.id } });
  return NextResponse.json({ success: true, clientId: client.id });
}
