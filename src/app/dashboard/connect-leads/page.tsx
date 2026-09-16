import { ConnectLeads } from "@/Components/Dashboard/ConnectSite/ConnectLeads";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  const language = session?.user?.language;

  return {
    title: language === "en" ? "Connect Leads" : "Підключити зявки",
  };
}

export default async function page() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return <ConnectLeads />;
}
