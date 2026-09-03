"use client";

import Link from "next/link";

import "./style.css";
import { useSelector } from "react-redux";
import { RootState } from "@/app/redux/languague/store";

export function Login() {
  const { language } = useSelector((store: RootState) => store.language);
  const isEnglish = language === "en";
  return (
    <main className="login">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">{isEnglish ? "Sign In" : "Вхід"}</h1>

            <p className="login-description">
              {isEnglish
                ? "Sign in to your Lentra account"
                : "Увійдіть до свого акаунту Lentra"}
            </p>
          </div>

          <form className="login-form">
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

              <input
                id="password"
                name="password"
                type="password"
                placeholder={
                  isEnglish ? "Enter your password" : "Введіть ваш пароль"
                }
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-button">
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
