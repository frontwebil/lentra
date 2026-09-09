import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  const session = await getServerSession();

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { websiteName, url } = await req.json();

  if (!websiteName || !url) {
    return NextResponse.json(
      { message: "Website name and URL are required" },
      { status: 400 },
    );
  }

  const xSiteId = crypto.randomBytes(4).toString("hex");

  const website = await prisma.website.create({
    data: {
      userId: session.user.id,
      websiteName,
      websiteUrl: url,
      xSiteId,
    },
  });

  return NextResponse.json({ website }, { status: 201 });
}
