import {
  AllLeads,
  AllLeadsRow,
  AllLeadsStatusOption,
} from "@/Components/Dashboard/Leeds/AllLeads/AllLeads";
import type { Prisma } from "@/generated/prisma/client";
import { authOptions } from "@/lib/auth";
import { summarizeLeadFields } from "@/lib/lead-fields";
import {
  buildLeadSearchWhere,
  buildLeadStatusWhere,
  parseLeadSearchQuery,
} from "@/lib/lead-search";
import prisma from "@/lib/prisma";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

const PAGE_SIZE = 20;

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  return { title: session?.user?.language === "en" ? "All leads" : "Усі ліди" };
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (value: string | string[] | undefined) =>
  (Array.isArray(value) ? value[0] : value) ?? "";

export default async function AllLeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect("/login");
  const userId = session.user.id;

  const params = await searchParams;
  const query = parseLeadSearchQuery(params.q);
  const siteParam = first(params.site).slice(0, 100);
  const statusParam = first(params.status).slice(0, 100);
  const requestedPage = Math.max(1, Math.floor(Number(first(params.page)) || 1));

  // Only the company's own websites can be selected: an unknown/foreign
  // ?site= value is ignored instead of being used as a raw filter.
  const websites = await prisma.website.findMany({
    where: { userId },
    select: {
      id: true,
      xSiteId: true,
      websiteName: true,
      websiteUrl: true,
      leadSchema: true,
      statuses: true,
    },
    orderBy: { createdAt: "asc" },
  });
  const selectedSite = websites.find((site) => site.xSiteId === siteParam);

  const filters = [
    await buildLeadSearchWhere(query, { userId, websiteId: selectedSite?.id }),
    buildLeadStatusWhere(statusParam),
  ].filter((item): item is Prisma.LeadWhereInput => Boolean(item));

  const where: Prisma.LeadWhereInput = {
    userId,
    ...(selectedSite ? { websiteId: selectedSite.id } : {}),
    ...(filters.length ? { AND: filters } : {}),
  };

  const total = await prisma.lead.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requestedPage, totalPages);

  const leads = await prisma.lead.findMany({
    where,
    select: {
      id: true,
      websiteId: true,
      fields: true,
      status: true,
      isNew: true,
      createdAt: true,
      client: {
        select: { id: true, name: true, phone: true, discountPercent: true },
      },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const siteById = new Map(websites.map((site) => [site.id, site]));
  const rows: AllLeadsRow[] = leads.map((lead) => {
    const site = siteById.get(lead.websiteId);
    return {
      id: lead.id,
      createdAt: lead.createdAt.toISOString(),
      isNew: lead.isNew ?? false,
      status: lead.status,
      website: site
        ? { xSiteId: site.xSiteId, name: site.websiteName, url: site.websiteUrl }
        : null,
      summary: summarizeLeadFields(lead.fields, site?.leadSchema),
      client: lead.client,
    };
  });

  // Status options: "New" + configured statuses of the selected site (or of
  // all sites, de-duplicated by name).
  const statusMap = new Map<string, AllLeadsStatusOption>();
  for (const site of selectedSite ? [selectedSite] : websites) {
    const list = Array.isArray(site.statuses)
      ? (site.statuses as { name?: unknown; colorId?: unknown }[])
      : [];
    for (const item of list) {
      if (typeof item?.name !== "string" || !item.name.trim()) continue;
      if (item.name.toLowerCase() === "new") continue;
      if (!statusMap.has(item.name)) {
        statusMap.set(item.name, {
          name: item.name,
          colorId: typeof item.colorId === "string" ? item.colorId : "gray",
        });
      }
    }
  }

  return (
    <AllLeads
      rows={rows}
      total={total}
      page={page}
      pageSize={PAGE_SIZE}
      totalPages={totalPages}
      query={query}
      selectedSite={selectedSite?.xSiteId ?? ""}
      selectedStatus={statusParam}
      websites={websites.map((site) => ({
        xSiteId: site.xSiteId,
        name: site.websiteName,
      }))}
      statusOptions={Array.from(statusMap.values())}
    />
  );
}
