import { Clients } from "@/Components/Dashboard/Clients/Clients";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return { title: session.user.language === "en" ? "Clients" : "Клієнти" };
}

export default async function ClientsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <Clients />;
}
