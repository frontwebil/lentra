import { Login } from "@/Components/LoginPage/Login/Login";
import { LoginHeader } from "@/Components/LoginPage/LoginHeader/LoginHeader";
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
