import { Clients } from "@/Components/Dashboard/Clients/Clients";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata(): Promise<Metadata> {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return { title: session.user.language === "en" ? "Client" : "Клієнт" };
}

export default async function ClientPage({ params }: Props) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  const { id } = await params;
  const client = await prisma.client.findFirst({ where: { id, userId: session.user.id }, select: { id: true } });
  if (!client) redirect("/dashboard/clients");
  return <Clients initialClientId={id} />;
}
