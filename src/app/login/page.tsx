import { Login } from "@/Components/AuthPage/Login/Login";
import { LoginHeader } from "@/Components/AuthPage/LoginHeader/LoginHeader";
import AuthSessionProvider from "@/lib/sessionProvider";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign In",
};

export default async function LoginPage() {
  const session = await getServerSession();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthSessionProvider>
      <section className="login-page">
        <LoginHeader />
        <Login />
      </section>
    </AuthSessionProvider>
  );
}
