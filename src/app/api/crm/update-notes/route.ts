import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export type NoteItem = {
  time: string;
  text: string;
};

export type LogItem = {
  type: string;
  time: string;
  text?: string;
};

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { note, leadId } = await req.json();

  console.log(note, leadId);

  if (!note || typeof note !== "string" || !note.trim() || !leadId) {
    return NextResponse.json(
      { message: "All fields are required!" },
      { status: 400 },
    );
  }

  const lead = await prisma.lead.findFirst({
    where: {
      id: leadId,
      userId: session.user.id,
    },
    include: {
      user: true,
    },
  });

  if (!lead) {
    return NextResponse.json({ message: "Lead not found" }, { status: 404 });
  }

  const now = new Date().toISOString();

  const newNoteItem: NoteItem = {
    time: now,
    text: note.trim(),
  };

  const currentNotes = (Array.isArray(lead.notes)
    ? lead.notes
    : []) as unknown as NoteItem[];

  const updatedNotes = [newNoteItem, ...currentNotes];

  const currentLogs = (Array.isArray(lead.logs)
    ? lead.logs
    : []) as unknown as LogItem[];

  const isUk = lead.user.language === "uk";
  const truncatedText =
    newNoteItem.text.length > 35
      ? `${newNoteItem.text.slice(0, 35)}...`
      : newNoteItem.text;

  const newLogItem: LogItem = {
    type: "note-added",
    time: now,
    text: `${isUk ? "Додано нотатку" : "Note added"}: "${truncatedText}"`,
  };

  const updatedLogs = [newLogItem, ...currentLogs];

  await prisma.lead.update({
    where: { id: lead.id },
    data: {
      notes: updatedNotes,
      logs: updatedLogs,
    },
  });

  return NextResponse.json({
    success: true,
    newNote: newNoteItem,
    notes: updatedNotes,
    logs: updatedLogs,
  });
}
