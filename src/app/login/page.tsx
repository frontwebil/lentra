import { Login } from "@/Components/AuthPage/Login/Login";
import { LoginHeader } from "@/Components/AuthPage/LoginHeader/LoginHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вхід",
  description: "Увійдіть у свій акаунт Lentra",
};

export default function LoginPage() {
  return (
    <section className="login-page">
      <LoginHeader />
      <Login />
    </section>
  );
}
