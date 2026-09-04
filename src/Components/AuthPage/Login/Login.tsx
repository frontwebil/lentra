"use client";

import Link from "next/link";
import { signIn, useSession } from "next-auth/react";

import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/languague/store";
import { useEffect, useState } from "react";
import { setLanguage } from "@/app/redux/languague/languageSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "sonner";

export function Login() {
  const { language } = useSelector((store: RootState) => store.language);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();

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

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) {
      return;
    }

    if (!formData.email || !formData.password) {
      toast.error(
        isEnglish
          ? "Please fill in all fields"
          : "Будь ласка, заповніть всі поля",
      );
      return;
    }
    setLoading(true);
    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });
      if (!result) {
        toast.error(isEnglish ? "Something went wrong" : "Щось пішло не так");
        return;
      }
      if (result.error === "EMAIL_NOT_CONFIRMED") {
        toast.error(
          isEnglish
            ? "Please check your email to confirm your account. If you don't see the email, check your Spam folder."
            : "Перевірте вашу пошту, щоб підтвердити акаунт. Якщо листа немає - перевірте папку «Спам».",
        );

        return;
      }

      if (result.error) {
        toast.error(
          isEnglish ? "Invalid email or password" : "Невірний email або пароль",
        );
        return;
      }
      toast.success(
        isEnglish ? "Successfully signed in" : "Ви успішно увійшли",
      );
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Login error:", error);
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
    <main className="login">
      {loading && <div className="page-loader"></div>}

      <div className="login-container">
        <div className="login-card">
          {loading && (
            <div className="widget-loader">
              <div className="loader" />
            </div>
          )}

          <div className="login-header">
            <h1 className="login-title">{isEnglish ? "Sign In" : "Вхід"}</h1>

            <p className="login-description">
              {isEnglish
                ? "Sign in to your Lentra account"
                : "Увійдіть до свого акаунту Lentra"}
            </p>
          </div>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-field">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder={
                  isEnglish ? "Enter your email" : "Введіть ваш email"
                }
                autoComplete="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div className="login-field">
              <div className="login-password-header">
                <label htmlFor="password">
                  {isEnglish ? "Password" : "Пароль"}
                </label>
                <Link href="/forgot-password">
                  {isEnglish ? "Forgot password?" : "Забули пароль?"}
                </Link>
              </div>
              <div style={{ position: "relative" }}>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={
                    isEnglish ? "Enter your password" : "Введіть ваш пароль"
                  }
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <div
                  className="login-field-password-wrap-button-show"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEye /> : <FaEyeSlash />}
                </div>
              </div>
            </div>

            <button type="submit" className="login-button" disabled={loading}>
              {isEnglish ? "Sign In" : "Увійти"}
            </button>
          </form>

          <div className="login-footer">
            <span>
              {isEnglish ? "Don't have an account?" : "Ще немає акаунту?"}
            </span>

            <Link href="/register">
              {isEnglish ? "Sign Up" : "Зареєструватися"}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
