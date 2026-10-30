import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

type Props = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const result = await prisma.client.deleteMany({ where: { id, userId: session.user.id } });
  if (result.count === 0) return NextResponse.json({ message: "Client not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}

export async function PATCH(req: Request, { params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => null);
  const hasNotes = body !== null && Object.prototype.hasOwnProperty.call(body, "notes");
  const hasDiscount = body !== null && Object.prototype.hasOwnProperty.call(body, "discountPercent");
  const hasFields = body !== null && Object.prototype.hasOwnProperty.call(body, "fields");
  const notes = body?.notes;
  const discountPercent = body?.discountPercent;
  const fields = body?.fields;

  if (!hasNotes && !hasDiscount && !hasFields) {
    return NextResponse.json({ message: "No client fields provided" }, { status: 400 });
  }
  if (hasNotes && notes !== null && (typeof notes !== "string" || notes.length > 5000)) {
    return NextResponse.json({ message: "Notes must be 5000 characters or fewer" }, { status: 400 });
  }
  if (hasDiscount && discountPercent !== null && (typeof discountPercent !== "number" || !Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100)) {
    return NextResponse.json({ message: "Discount must be between 0 and 100" }, { status: 400 });
  }
  if (hasFields && (!fields || typeof fields !== "object" || Array.isArray(fields))) {
    return NextResponse.json({ message: "Client information must be an object" }, { status: 400 });
  }

  const updateData: { notes?: string | null; discountPercent?: number | null } = {};
  if (hasNotes) updateData.notes = notes;
  if (hasDiscount) updateData.discountPercent = discountPercent;
  if (hasFields) Object.assign(updateData, { fields });
  const result = await prisma.client.updateMany({
    where: { id, userId: session.user.id },
    data: updateData,
  });
  if (result.count === 0) return NextResponse.json({ message: "Client not found" }, { status: 404 });

  const client = await prisma.client.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true, notes: true, discountPercent: true, updatedAt: true },
  });
  return NextResponse.json({ client });
}
