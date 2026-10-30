import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { companyName: true, language: true },
  });

  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: unknown = await req.json();

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ message: "Invalid settings" }, { status: 400 });
    }

    const { companyName, language } = body as Record<string, unknown>;

    if (
      typeof companyName !== "string" ||
      companyName.trim().length < 2 ||
      companyName.trim().length > 100
    ) {
      return NextResponse.json(
        { message: "Company name must be between 2 and 100 characters" },
        { status: 400 },
      );
    }

    if (language !== "uk" && language !== "en") {
      return NextResponse.json({ message: "Invalid language" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: { companyName: companyName.trim(), language },
      select: { companyName: true, language: true },
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error("Update CRM settings error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
