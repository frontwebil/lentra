import { Settings } from "@/Components/Dashboard/Settings/Settings";
import { authOptions } from "@/lib/auth";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return {
    title: session.user.language === "en" ? "Settings" : "Налаштування",
  };
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return <Settings />;
}
