import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type SchemaField = { key: string; label?: string; type?: string };
type JsonRecord = Record<string, unknown>;

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : {};
}

function asSchema(value: unknown): SchemaField[] {
  return Array.isArray(value) ? value as SchemaField[] : [];
}

function normalizePhone(value: unknown) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return digits.length >= 7 ? digits : "";
}

function isPhoneField(field: SchemaField) {
  return /phone|mobile|tel|телефон|мобіль/i.test(`${field.key} ${field.label ?? ""}`);
}

function suggestName(fields: JsonRecord, schema: SchemaField[], phone: string) {
  const nameField = schema.find((field) => /name|ім.?я|піб|contact/i.test(`${field.key} ${field.label ?? ""}`));
  const name = nameField ? String(fields[nameField.key] ?? "").trim() : "";
  return name || phone || "Клієнт без імені";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const clients = await prisma.client.findMany({
    where: { userId: session.user.id },
    select: {
      id: true, name: true, phone: true, fields: true, notes: true, discountPercent: true,
      _count: { select: { leads: true } },
      leads: {
        select: { id: true, createdAt: true, fields: true, website: { select: { websiteName: true, leadSchema: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ clients });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const leadId = typeof body?.leadId === "string" ? body.leadId : "";
  const requestedName = typeof body?.name === "string" ? body.name.trim() : "";
  const phoneFieldKey = typeof body?.phoneFieldKey === "string" ? body.phoneFieldKey : "";
  const attachMatchingLeads = body?.attachMatchingLeads !== false;
  if (!leadId) return NextResponse.json({ message: "Lead is required" }, { status: 400 });

  const lead = await prisma.lead.findFirst({
    where: { id: leadId, userId: session.user.id },
    include: { website: { select: { leadSchema: true } } },
  });
  if (!lead) return NextResponse.json({ message: "Lead not found" }, { status: 404 });
  if (lead.clientId) return NextResponse.json({ message: "Lead is already linked to a client" }, { status: 409 });

  const fields = asRecord(lead.fields);
  const schema = asSchema(lead.website.leadSchema);
  const clientFields = Object.fromEntries(
    Object.entries(fields).filter(([key]) => {
      const type = schema.find((field) => field.key === key)?.type;
      return type !== "category" && type !== "date" && type !== "time" && type !== "price";
    }),
  );
  const phoneField = schema.find((field) => field.key === phoneFieldKey) ?? schema.find(isPhoneField);
  const phoneValue = phoneField ? String(fields[phoneField.key] ?? "").trim() : "";
  const phone = normalizePhone(phoneValue);
  const name = requestedName || suggestName(fields, schema, phoneValue);

  const matchingLeadIds = new Set<string>([lead.id]);
  if (attachMatchingLeads && phone) {
    const candidates = await prisma.lead.findMany({
      where: { userId: session.user.id, clientId: null },
      select: { id: true, fields: true, website: { select: { leadSchema: true } } },
    });
    for (const candidate of candidates) {
      const candidateFields = asRecord(candidate.fields);
      const candidatePhone = asSchema(candidate.website.leadSchema)
        .filter(isPhoneField)
        .map((field) => normalizePhone(candidateFields[field.key]))
        .find(Boolean);
      if (candidatePhone === phone) matchingLeadIds.add(candidate.id);
    }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const created = await tx.client.create({
        data: {
          userId: session.user.id,
          name,
          phone: phoneValue || null,
          fields: clientFields as Prisma.InputJsonValue,
        },
    select: { id: true, name: true, phone: true, discountPercent: true },
      });
      const matchingLeads = await tx.lead.findMany({
        where: { id: { in: [...matchingLeadIds] }, userId: session.user.id, clientId: null },
        select: { id: true, logs: true },
      });
      const isUk = session.user.language !== "en";
      const now = new Date().toISOString();
      let leadLogs: { type: string; time: string; text?: string }[] = [];
      await Promise.all(matchingLeads.map((matchingLead) => {
        const oldLogs = Array.isArray(matchingLead.logs)
          ? matchingLead.logs as { type: string; time: string; text?: string }[]
          : [];
        const text = matchingLead.id === lead.id
          ? (isUk ? `Створено клієнта «${created.name}» та прив’язано заявку` : `Created client “${created.name}” and linked the lead`)
          : (isUk ? `Заявку автоматично прив’язано до клієнта: ${created.name}` : `Lead automatically linked to client: ${created.name}`);
        const logs = [{ type: "client-linked", time: now, text }, ...oldLogs];
        if (matchingLead.id === lead.id) leadLogs = logs;
        return tx.lead.update({ where: { id: matchingLead.id }, data: { clientId: created.id, logs } });
      }));
      return { client: created, linkedLeads: matchingLeads.length, leadLogs };
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Create client from lead error:", error);
    return NextResponse.json({ message: "Failed to create client" }, { status: 500 });
  }
}
