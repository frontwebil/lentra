import { LoginHeader } from "@/Components/LoginPage/LoginHeader/LoginHeader";
import { Register } from "@/Components/LoginPage/Register/Register";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Реєстрація",
  description: "Увійдіть у свій акаунт Lentra",
};

export default function page() {
  return (
    <section className="register-page">
      <LoginHeader />
      <Register />
    </section>
  );
}
