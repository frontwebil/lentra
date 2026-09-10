import { LoginHeader } from "@/Components/AuthPage/LoginHeader/LoginHeader";
import { Register } from "@/Components/AuthPage/Register/Register";
import { authOptions } from "@/lib/auth";
import AuthSessionProvider from "@/lib/sessionProvider";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign Up",
};

export default async function RegisterPage() {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthSessionProvider>
      <section className="register-page">
        <LoginHeader />
        <Register />
      </section>
    </AuthSessionProvider>
  );
}
