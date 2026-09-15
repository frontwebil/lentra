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
  const data = await req.json();
  console.log(data, siteSchema);

  for (const field of siteSchema) {
    
  }

  // console.log("Origin:", origin);
  // console.log("X-Site-ID:", siteId);
  // console.log("Headers:", Object.fromEntries(req.headers.entries()));

  return Response.json({ success: true });
}
