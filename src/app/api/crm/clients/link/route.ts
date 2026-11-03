import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const leadId = typeof body?.leadId === "string" ? body.leadId : "";
  const clientId = typeof body?.clientId === "string" ? body.clientId.trim() : "";
  const isUnlink = body?.clientId === null;
  if (!leadId || (!clientId && !isUnlink)) {
    return NextResponse.json({ message: "Lead and a valid client selection are required" }, { status: 400 });
  }

  const [lead, client] = await Promise.all([
    prisma.lead.findFirst({ where: { id: leadId, userId: session.user.id }, include: { client: { select: { id: true, name: true } } } }),
    clientId ? prisma.client.findFirst({ where: { id: clientId, userId: session.user.id }, select: { id: true, name: true } }) : Promise.resolve(null),
  ]);
  if (!lead) return NextResponse.json({ message: "Lead not found" }, { status: 404 });
  if (clientId && !client) return NextResponse.json({ message: "Client not found" }, { status: 404 });
  if (lead.clientId === (client?.id ?? null)) {
    return NextResponse.json({ success: true, clientId: lead.clientId, logs: lead.logs ?? [] });
  }

  const now = new Date().toISOString();
  const isUk = session.user.language !== "en";
  const text = client
    ? lead.client
      ? (isUk ? `Клієнта змінено: ${lead.client.name} → ${client.name}` : `Client changed: ${lead.client.name} → ${client.name}`)
      : (isUk ? `Заявку прив’язано до клієнта: ${client.name}` : `Lead linked to client: ${client.name}`)
    : (isUk ? `Заявку відв’язано від клієнта: ${lead.client?.name ?? ""}` : `Lead unlinked from client: ${lead.client?.name ?? ""}`);
  const oldLogs = Array.isArray(lead.logs) ? lead.logs as { type: string; time: string; text?: string }[] : [];
  const logs = [{ type: client ? "client-linked" : "client-unlinked", time: now, text }, ...oldLogs];

  await prisma.lead.update({
    where: { id: lead.id },
    data: { clientId: client?.id ?? null, logs },
  });
  return NextResponse.json({ success: true, clientId: client?.id ?? null, logs });
}
