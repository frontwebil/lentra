"use client";

import { setLanguage } from "@/app/redux/languague/languageSlice";
import { RootState } from "@/app/redux/languague/store";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import "./style.css";

export function ConfirmPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isValid, setValid] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const dispatch = useDispatch();
  const { language } = useSelector((store: RootState) => store.language);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

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

  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    if (!token) {
      setLoading(false);
      router.replace("/login");
      toast.error(
        isEnglish
          ? "This password reset link is invalid or has expired."
          : "Це посилання для відновлення пароля недійсне або термін його дії закінчився.",
      );
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetch("/api/User/forgot-password/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        if (res.status === 429) {
          toast.error(
            isEnglish
              ? "Too many attempts. Please try again later."
              : "Забагато спроб. Спробуйте пізніше.",
          );
          router.replace("/login");
          return;
        }

        const data = await res.json();

        if (data.isValid) {
          setValid(true);
          setLoading(false);
        } else {
          setValid(false);
          toast.error(
            isEnglish
              ? "This password reset link is invalid or has expired."
              : "Це посилання для відновлення пароля недійсне або термін його дії закінчився.",
          );
          router.replace("/login");
        }
      } catch {
        setValid(false);
        router.replace("/login");
      }
    };

    checkToken();
  }, [token, router, isEnglish]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (!password || !confirmPassword) {
      toast.error(
        isEnglish
          ? "Please fill in both password fields."
          : "Будь ласка, заповніть обидва поля пароля.",
      );
      return;
    }
    if (password !== confirmPassword) {
      toast.error(
        isEnglish ? "Passwords do not match." : "Паролі не співпадають.",
      );
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/User/forgot-password/confirm-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.status === 429) {
        toast.error(
          isEnglish
            ? "Too many attempts. Please try again later."
            : "Забагато спроб. Спробуйте пізніше.",
        );
        return;
      }

      if (!res.ok) {
        toast.error(
          isEnglish
            ? "Unable to reset your password. The link may have expired."
            : "Не вдалося змінити пароль. Можливо, термін дії посилання закінчився.",
        );
        return;
      }
      toast.success(
        isEnglish
          ? "Your password has been successfully changed."
          : "Ваш пароль успішно змінено.",
      );
      router.replace("/login");
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error(
        isEnglish
          ? "Something went wrong. Please try again."
          : "Щось пішло не так. Спробуйте ще раз.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="confirm-password">
      {loading && <div className="page-loader" />}
      <div className="confirm-password-container">
        <div className="confirm-password-card">
          {loading && (
            <div className="widget-loader">
              <div className="loader" />
            </div>
          )}
          {!loading && isValid && (
            <>
              <div className="confirm-password-header">
                <h1 className="confirm-password-title">
                  {isEnglish
                    ? "Create a new password"
                    : "Створіть новий пароль"}
                </h1>
                <p className="confirm-password-description">
                  {isEnglish
                    ? "Enter your new password below to secure your account."
                    : "Введіть новий пароль нижче, щоб захистити свій акаунт."}
                </p>
              </div>
              <form className="confirm-password-form" onSubmit={handleSubmit}>
                <div className="confirm-password-field">
                  <label htmlFor="password">
                    {isEnglish ? "New password" : "Новий пароль"}
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder={
                      isEnglish
                        ? "Enter your new password"
                        : "Введіть новий пароль"
                    }
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="confirm-password-field">
                  <label htmlFor="confirm-password">
                    {isEnglish ? "Confirm password" : "Підтвердіть пароль"}
                  </label>
                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    placeholder={
                      isEnglish
                        ? "Repeat your new password"
                        : "Повторіть новий пароль"
                    }
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="confirm-password-button"
                  disabled={loading}
                >
                  {isEnglish ? "Change password" : "Змінити пароль"}
                </button>
              </form>
              <div className="confirm-password-footer">
                <button type="button" onClick={() => router.replace("/login")}>
                  {isEnglish ? "← Back to Sign In" : "← Повернутися до входу"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
