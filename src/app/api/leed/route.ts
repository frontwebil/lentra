/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-Site-ID",
    },
  });
}

type LeadField = {
  key: string;
  type: string;
  label: string;
  required: boolean;
};

function isLeadSchema(value: unknown): value is LeadField[] {
  return (
    Array.isArray(value) &&
    value.every(
      (field) =>
        typeof field === "object" &&
        field !== null &&
        typeof field.key === "string" &&
        typeof field.type === "string" &&
        typeof field.label === "string" &&
        typeof field.required === "boolean",
    )
  );
}

export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  const siteId = req.headers.get("x-site-id");

  if (!siteId) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  const crmSite = await prisma.website.findUnique({
    where: {
      xSiteId: siteId,
    },
  });

  if (!crmSite) {
    return NextResponse.json({ message: "Invalid site ID" }, { status: 400 });
  }

  const isAllowedDomain = origin == crmSite?.websiteUrl;

  if (!isAllowedDomain) {
    return NextResponse.json(
      { message: "Allowed site not found" },
      { status: 403 },
    );
  }

  const siteSchema = crmSite.leadSchema;

  if (!isLeadSchema(siteSchema)) {
    return NextResponse.json(
      { message: "Invalid lead schema" },
      { status: 500 },
    );
  }

  const data = await req.json();
  const leadData: any = {};

  for (const field of siteSchema) {
    const value = data[field.key];

    if (field.required && (!value || String(value).trim() === "")) {
      return NextResponse.json(
        { message: `${field.label} is required` },
        { status: 400 },
      );
    }

    leadData[field.key] = value ?? "";
  }

  await prisma.lead.create({
    data: {
      userId: crmSite.userId,
      websiteId: crmSite.id,
      fields: leadData,
    },
  });

  return NextResponse.json(
    {
      success: true,
      message: "Lead created successfully",
    },
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
