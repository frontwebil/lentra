import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { statuses, websiteId } = await req.json();
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    if (!websiteId) {
      return NextResponse.json(
        { message: "websiteId not found" },
        { status: 400 },
      );
    }

    if (!statuses) {
      return NextResponse.json(
        { message: "statuses not found" },
        { status: 400 },
      );
    }

    const currentSite = await prisma.website.findFirst({
      where: {
        id: websiteId,
        userId: session.user.id,
      },
    });

    if (!currentSite) {
      return NextResponse.json(
        { message: "Website not found" },
        { status: 404 },
      );
    }

    const updatedSite = await prisma.website.update({
      where: {
        id: currentSite.id,
      },
      data: {
        statuses,
      },
    });

    return NextResponse.json(
      {
        message: "Statuses updated successfully",
        statuses: updatedSite.statuses,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Update statuses error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
