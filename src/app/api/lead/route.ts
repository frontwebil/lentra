/* eslint-disable @typescript-eslint/no-explicit-any */
import prisma from "@/lib/prisma";
import { notifyUserAboutNewLead } from "@/lib/telegramNotifications";
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

const LOG_MESSAGES = {
  uk: {
    createdLead: "Ліда створено",
  },
  en: {
    createdLead: "Lead created",
  },
} as const;

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
    include: {
      user: true,
    },
  });

  if (!crmSite) {
    return NextResponse.json({ message: "Invalid site ID" }, { status: 400 });
  }

  const siteOwner = crmSite.user;

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

    if (field.type === "date" && value) {
      const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(String(value));

      if (!isValidFormat) {
        return NextResponse.json(
          {
            message: `${field.label} has an invalid date format , you need format YYYY-MM-DD`,
          },
          { status: 400 },
        );
      }
    }

    if (field.type === "time" && value) {
      const isValidFormat = /^([01]\d|2[0-3]):[0-5]\d$/.test(String(value));

      if (!isValidFormat) {
        return NextResponse.json(
          {
            message: `${field.label} has an invalid time format, you need format HH:MM`,
          },
          { status: 400 },
        );
      }
    }

    leadData[field.key] = value ?? "";
  }

  const lang = (siteOwner?.language as "uk" | "en") || "uk";
  const logText =
    LOG_MESSAGES[lang]?.createdLead ?? LOG_MESSAGES.uk.createdLead;

  await prisma.lead.create({
    data: {
      userId: crmSite.userId,
      websiteId: crmSite.id,
      fields: leadData,
      status: { colorId: "new", text: "New" },
      logs: [
        {
          type: "created-lead",
          text: logText,
          time: new Date().toISOString(),
        },
      ],
      notes: "",
    },
  });

  await notifyUserAboutNewLead({
    userId: siteOwner.id,
    language: lang,
    websiteName: crmSite.websiteName,
    fields: leadData,
    schema: siteSchema,
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
