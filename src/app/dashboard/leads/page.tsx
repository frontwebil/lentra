import { Leeds } from "@/Components/Dashboard/Leeds/Leeds";
import { authOptions } from "@/lib/auth";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  const language = session?.user?.language;

  return {
    title: language === "en" ? "Leads" : "Заявки",
  };
}

export default async function LeedsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <section className="LeedsPage">
      <Leeds />
    </section>
  );
}
