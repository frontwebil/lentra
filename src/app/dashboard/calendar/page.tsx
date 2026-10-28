import { Calendar } from "@/Components/Dashboard/Calendar/Calendar";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return { title: session.user.language === "en" ? "Calendar" : "Календар" };
}

export default async function CalendarPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <Calendar />;
}
