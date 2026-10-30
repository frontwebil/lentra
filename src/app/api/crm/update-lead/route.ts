import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma/client";

type LeadStatus = {
  text: string;
  colorId: string;
};

type LogItem = {
  type: string;
  time: string;
  text?: string;
};

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { leadId, xSiteId, fields, status } = await req.json();

    if (
      !leadId ||
      !xSiteId ||
      !fields ||
      typeof fields !== "object" ||
      Array.isArray(fields) ||
      !status ||
      typeof status.text !== "string" ||
      typeof status.colorId !== "string"
    ) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 },
      );
    }

    const website = await prisma.website.findFirst({
      where: {
        userId: session.user.id,
        xSiteId,
      },
      select: {
        id: true,
        statuses: true,
        leadSchema: true,
      },
    });

    if (!website) {
      return NextResponse.json(
        { message: "Website not found" },
        { status: 404 },
      );
    }

    const lead = await prisma.lead.findFirst({
      where: {
        id: leadId,
        websiteId: website.id,
        userId: session.user.id,
      },
    });

    if (!lead) {
      return NextResponse.json({ message: "Lead not found" }, { status: 404 });
    }

    const schema = Array.isArray(website.leadSchema)
      ? (website.leadSchema as Array<{
          key: string;
          label?: string;
          type?: string;
        }>)
      : [];

    const allowedKeys = new Set(schema.map((field) => field.key));

    if (Object.keys(fields).some((key) => !allowedKeys.has(key))) {
      return NextResponse.json(
        { message: "Unknown lead field" },
        { status: 400 },
      );
    }

    const oldFields: Record<string, unknown> =
      lead.fields &&
      typeof lead.fields === "object" &&
      !Array.isArray(lead.fields)
        ? (lead.fields as Record<string, unknown>)
        : {};

    const normalizedFields: Record<string, unknown> = {
      ...oldFields,
    };

    for (const field of schema) {
      if (!Object.prototype.hasOwnProperty.call(fields, field.key)) {
        continue;
      }

      const value = fields[field.key];

      if (
        field.type === "price" &&
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (typeof value !== "number" || !Number.isFinite(value) || value < 0)
      ) {
        return NextResponse.json(
          { message: `Invalid price: ${field.key}` },
          { status: 400 },
        );
      }

      if (
        field.type === "category" &&
        value !== undefined &&
        value !== null &&
        value !== "" &&
        typeof value !== "string"
      ) {
        return NextResponse.json(
          { message: `Invalid category: ${field.key}` },
          { status: 400 },
        );
      }

      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        (field.type === "number" || field.type === "price") &&
        (typeof value !== "number" || !Number.isFinite(value))
      ) {
        return NextResponse.json(
          { message: `Invalid number: ${field.key}` },
          { status: 400 },
        );
      }

      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        field.type === "boolean" &&
        typeof value !== "boolean"
      ) {
        return NextResponse.json(
          { message: `Invalid boolean: ${field.key}` },
          { status: 400 },
        );
      }

      normalizedFields[field.key] = value;
    }

    const customStatuses = Array.isArray(website.statuses)
      ? (website.statuses as unknown as {
          id: string;
          name: string;
          colorId: string;
        }[])
      : [];

    const validStatus =
      (status.colorId === "new" &&
        ["New", "Новий", "Новый"].includes(status.text)) ||
      customStatuses.some(
        (item) => item.name === status.text && item.colorId === status.colorId,
      );

    if (!validStatus) {
      return NextResponse.json(
        { message: "Invalid lead status" },
        { status: 400 },
      );
    }

    const oldStatus =
      lead.status &&
      typeof lead.status === "object" &&
      !Array.isArray(lead.status)
        ? (lead.status as unknown as LeadStatus)
        : { text: "New", colorId: "new" };

    const statusChanged =
      oldStatus.text !== status.text || oldStatus.colorId !== status.colorId;

    const now = new Date().toISOString();
    const isUk = session.user.language === "uk";

    const oldLogs = Array.isArray(lead.logs)
      ? (lead.logs as unknown as LogItem[])
      : [];

    const newLogs: LogItem[] = [];

    if (statusChanged) {
      newLogs.push({
        type: "status-changed",
        time: now,
        text: isUk
          ? `Статус змінено: ${oldStatus.text} → ${status.text}`
          : `Status changed: ${oldStatus.text} → ${status.text}`,
      });
    }

    for (const field of schema) {
      const key = field.key;

      if (!Object.prototype.hasOwnProperty.call(fields, key)) {
        continue;
      }

      const oldValue = oldFields[key];
      const newValue = normalizedFields[key];

      if (JSON.stringify(oldValue) === JSON.stringify(newValue)) {
        continue;
      }

      const label = field.label || key;

      const formatValue = (value: unknown) => {
        if (value === null || value === undefined || value === "") {
          return isUk ? "Не вказано" : "Not specified";
        }

        if (typeof value === "boolean") {
          if (isUk) return value ? "Так" : "Ні";
          return value ? "Yes" : "No";
        }

        if (typeof value === "object") {
          return JSON.stringify(value);
        }

        return String(value);
      };

      newLogs.push({
        type: "field-changed",
        time: now,
        text: isUk
          ? `Змінено поле «${label}»: ${formatValue(oldValue)} → ${formatValue(newValue)}`
          : `Field "${label}" changed: ${formatValue(oldValue)} → ${formatValue(newValue)}`,
      });
    }

    const updatedLogs = [...newLogs, ...oldLogs];

    const data: Prisma.LeadUpdateInput = {
      fields: normalizedFields as Prisma.InputJsonValue,
      status: status as unknown as Prisma.InputJsonValue,
      logs: updatedLogs as unknown as Prisma.InputJsonValue,
    };

    if (statusChanged) {
      data.isNew = false;
    }

    const updated = await prisma.lead.update({
      where: {
        id: lead.id,
      },
      data,
    });

    return NextResponse.json({
      fields: updated.fields,
      status: updated.status,
      logs: updated.logs,
    });
  } catch (error) {
    console.error("Error updating lead:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
