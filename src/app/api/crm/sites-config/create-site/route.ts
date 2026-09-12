import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import crypto from "crypto";
import dns from "node:dns/promises";
import { authOptions } from "@/lib/auth";

async function validateWebsiteUrl(value: string) {
  try {
    const url = new URL(normalizeUrl(value));

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    if (!url.hostname.includes(".")) {
      return false;
    }

    const res = await dns.lookup(url.hostname);
    console.log(res);

    return true;
  } catch {
    return false;
  }
}

function normalizeUrl(value: string) {
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { websiteName, url, leadFields } = await req.json();

  if (!websiteName || !url) {
    return NextResponse.json(
      { message: "Website name and URL are required" },
      { status: 400 },
    );
  }

  const isValidSite = await validateWebsiteUrl(url);

  if (!isValidSite) {
    return NextResponse.json(
      { message: "Website is invalid" },
      { status: 403 },
    );
  }

  const xSiteId = crypto.randomBytes(4).toString("hex");

  const website = await prisma.website.create({
    data: {
      userId: session.user.id,
      websiteName,
      websiteUrl: normalizeUrl(url),
      xSiteId,
      leadSchema: leadFields,
    },
  });

  return NextResponse.json({ website }, { status: 201 });
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await req.json();

  const website = await prisma.website.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!website) {
    return NextResponse.json({ message: "Website not found" }, { status: 404 });
  }

  await prisma.website.delete({
    where: {
      id: website.id,
    },
  });

  return NextResponse.json({
    success: true,
  });
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id, websiteName, url, leadFields } = await req.json();

  if (!id || !websiteName || !url) {
    return NextResponse.json(
      { message: "Website ID, name and URL are required" },
      { status: 400 },
    );
  }

  const website = await prisma.website.findFirst({
    where: {
      id,
      userId: session.user.id,
    },
  });

  if (!website) {
    return NextResponse.json({ message: "Website not found" }, { status: 404 });
  }

  const isValidSite = await validateWebsiteUrl(url);

  if (!isValidSite) {
    return NextResponse.json(
      { message: "Website is invalid" },
      { status: 403 },
    );
  }

  const updatedWebsite = await prisma.website.update({
    where: {
      id: website.id,
    },
    data: {
      websiteName,
      websiteUrl: normalizeUrl(url),
      leadSchema: leadFields,
    },
  });

  return NextResponse.json(
    {
      website: updatedWebsite,
    },
    { status: 200 },
  );
}
