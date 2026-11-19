import {
  LeadsTablePrefs,
  LeedsPage,
} from "@/Components/Dashboard/Leeds/LeedsPage/LeedsPage";
import { cookies } from "next/headers";
import { authOptions } from "@/lib/auth";
import { buildLeadSearchWhere, parseLeadSearchQuery } from "@/lib/lead-search";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  const { id } = await params;

  const website = await prisma.website.findUnique({
    where: {
      userId: session?.user.id,
      xSiteId: id,
    },
  });

  return {
    title: website?.websiteName ?? "Lentra CRM",
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const query = parseLeadSearchQuery((await searchParams).q);

  const site = await prisma.website.findUnique({
    where: { userId: session.user.id, xSiteId: id },
    select: { id: true },
  });

  if (!site) {
    redirect("/dashboard/leads");
  }

  const searchWhere = await buildLeadSearchWhere(query, {
    userId: session.user.id,
    websiteId: site.id,
  });

  const website = await prisma.website.findUnique({
    where: {
      userId: session.user.id,
      xSiteId: id,
    },
    include: {
      leads: {
        // The website is scoped to the user above; userId here is a second
        // guard so a search can never surface another company's lead.
        where: { userId: session.user.id, ...searchWhere },
        include: {
          client: { select: { id: true, name: true, discountPercent: true } },
        },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!website) {
    redirect("/dashboard/leads");
  }

  const cookieStore = await cookies();
  const readCookie = (name: string): unknown => {
    const value = cookieStore.get(name)?.value;
    if (!value) return undefined;
    try {
      return JSON.parse(value);
    } catch {
      return undefined;
    }
  };
  const asStringArray = (value: unknown) =>
    Array.isArray(value) && value.every((item) => typeof item === "string")
      ? (value as string[])
      : undefined;
  const widths = readCookie(`leads_col_widths_${website.id}`);

  const initialPrefs: LeadsTablePrefs = {
    visibleKeys: asStringArray(readCookie(`leads_visible_keys_${website.id}`)),
    visibleMetaColumns: asStringArray(
      readCookie(`leads_visible_meta_columns_${website.id}`),
    ),
    colWidths:
      widths && typeof widths === "object" && !Array.isArray(widths)
        ? Object.fromEntries(
            Object.entries(widths).filter(
              (entry): entry is [string, number] => typeof entry[1] === "number",
            ),
          )
        : undefined,
  };

  return (
    <LeedsPage
      website={website}
      searchQuery={query}
      initialPrefs={initialPrefs}
    />
  );
}
