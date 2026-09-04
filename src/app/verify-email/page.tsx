"use client";

import { Suspense, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";

import { RootState } from "@/app/redux/languague/store";
import { setLanguage } from "@/app/redux/languague/languageSlice";

import "./style.css";

function VerifyEmailContent() {
  const { language } = useSelector((store: RootState) => store.language);
  const dispatch = useDispatch();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    if (!token || token.length < 32) {
      setStatus("error");
      window.location.href = "/register";
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.post("/api/User/verify-token", {
          token,
        });

        setStatus("success");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token]);

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

  useEffect(() => {
    if (!token) {
      setStatus("error");
      return;
    }

    const verifyEmail = async () => {
      try {
        await axios.post("/api/User/verify-token", {
          token,
        });

        setStatus("success");
      } catch (error) {
        console.error(error);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token]);

  const isEnglish = language === "en";

  return (
    <main className="verify-page">
      <div className="verify-container">
        <div className="verify-card">
          <div className="verify-logo">
            Lentra<span>.</span>
          </div>

          {status === "loading" && (
            <div className="verify-content">
              <div className="verify-icon verify-icon-loading">
                <div className="verify-spinner" />
              </div>

              <h1 className="verify-title">
                {isEnglish ? "Verifying your email" : "Підтвердження email"}
              </h1>

              <p className="verify-description">
                {isEnglish
                  ? "Please wait a few seconds while we verify your email address."
                  : "Зачекайте кілька секунд, поки ми підтверджуємо вашу електронну адресу."}
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="verify-content">
              <div className="verify-icon verify-icon-success">✓</div>

              <h1 className="verify-title">
                {isEnglish ? "Email verified" : "Email підтверджено"}
              </h1>

              <p className="verify-description">
                {isEnglish
                  ? "Your email has been successfully verified. You can now sign in to your Lentra account."
                  : "Ваш email успішно підтверджено. Тепер ви можете увійти до свого акаунта Lentra."}
              </p>

              <Link href="/login" className="verify-button">
                {isEnglish ? "Sign In" : "Увійти"}
              </Link>
            </div>
          )}

          {status === "error" && (
            <div className="verify-content">
              <div className="verify-icon verify-icon-error">!</div>

              <h1 className="verify-title">
                {isEnglish ? "Invalid verification link" : "Посилання недійсне"}
              </h1>

              <p className="verify-description">
                {isEnglish
                  ? "This verification link is invalid or has expired."
                  : "Це посилання для підтвердження недійсне або термін його дії вже минув."}
              </p>

              <Link href="/register" className="verify-button">
                {isEnglish ? "Create Account" : "Зареєструватися"}
              </Link>
            </div>
          )}

          <div className="verify-footer">
            Lentra<span>.</span>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <VerifyEmailContent />
    </Suspense>
  );
}
