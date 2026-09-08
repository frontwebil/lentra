"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

import { RootState } from "@/app/redux/languague/store";
import { setLanguage } from "@/app/redux/languague/languageSlice";

import "./style.css";
import axios from "axios";

export function ForgotPassword() {
  const dispatch = useDispatch();

  const { language } = useSelector((store: RootState) => store.language);

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!language) {
      const savedLanguage = localStorage.getItem("language");

      if (savedLanguage === "en" || savedLanguage === "uk") {
        dispatch(setLanguage(savedLanguage));
      } else {
        dispatch(setLanguage("en"));
      }
    }
  }, [language, dispatch]);

  const isEnglish = language === "en";

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    if (!email) {
      toast.error(
        isEnglish ? "Please enter your email" : "Будь ласка, введіть ваш email",
      );
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/User/forgot-password", { email });

      setSent(true);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          toast.error(
            isEnglish
              ? "Too many attempts. Please try again later."
              : "Забагато спроб. Спробуйте пізніше.",
          );
          return;
        }
      }

      console.error("Forgot password error:", error);
      toast.error(
        isEnglish
          ? "Something went wrong. Please try again."
          : "Щось пішло не так. Спробуйте ще раз.",
      );
    } finally {
      setLoading(false);
      setEmail("");
    }
  };

  return (
    <main className="forgot-password">
      {loading && <div className="page-loader" />}

      <div className="forgot-password-container">
        <div className="forgot-password-card">
          {loading && (
            <div className="widget-loader">
              <div className="loader" />
            </div>
          )}
          {!sent ? (
            <>
              <div className="forgot-password-header">
                <h1 className="forgot-password-title">
                  {isEnglish ? "Reset your password" : "Відновлення пароля"}
                </h1>

                <p className="forgot-password-description">
                  {isEnglish
                    ? "Enter the email associated with your account and we'll send you a link to reset your password."
                    : "Введіть email, який ви використовували при реєстрації, і ми надішлемо вам посилання для відновлення пароля."}
                </p>
              </div>

              <form className="forgot-password-form" onSubmit={handleSubmit}>
                <div className="forgot-password-field">
                  <label htmlFor="email">Email</label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={
                      isEnglish ? "Enter your email" : "Введіть ваш email"
                    }
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  className="forgot-password-button"
                  disabled={loading}
                >
                  {isEnglish ? "Send reset link" : "Надіслати посилання"}
                </button>
              </form>

              <div className="forgot-password-footer">
                <Link href="/login">
                  {isEnglish ? "← Back to Sign In" : "← Повернутися до входу"}
                </Link>
              </div>
            </>
          ) : (
            <div className="forgot-password-success">
              <div className="forgot-password-success-icon">✓</div>

              <div className="forgot-password-header">
                <h1 className="forgot-password-title">
                  {isEnglish ? "Check your email" : "Перевірте вашу пошту"}
                </h1>

                <p className="forgot-password-description">
                  {isEnglish
                    ? `If an account with this email exists, we'll send a password reset link to ${email}.`
                    : `Якщо обліковий запис із цією поштою існує, ми надішлемо посилання для відновлення пароля на ${email}.`}
                </p>
              </div>

              {/* <button
                type="button"
                className="forgot-password-button"
                onClick={() => setSent(false)}
              >
                {isEnglish ? "Try another email" : "Ввести інший email"}
              </button> */}

              <div className="forgot-password-footer">
                <Link href="/login">
                  {isEnglish ? "← Back to Sign In" : "← Повернутися до входу"}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
