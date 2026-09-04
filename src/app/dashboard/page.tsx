"use client";

import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const session = useSession();
  const router = useRouter();

  if (session.status === "unauthenticated") {
    router.replace("/login");
  }

  return <div onClick={() => signOut()}>Вийти</div>;
}
