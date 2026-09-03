"use client";

import Link from "next/link";

import "./style.css";

import { useSelector } from "react-redux";

import { RootState } from "@/app/redux/languague/store";

export function Register() {
  const { language } = useSelector((store: RootState) => store.language);

  const isEnglish = language === "en";

  return (
    <main className="register">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1 className="register-title">
              {isEnglish ? "Sign Up" : "Реєстрація"}
            </h1>

            <p className="register-description">
              {isEnglish
                ? "Create your Lentra account"
                : "Створіть акаунт у Lentra"}
            </p>
          </div>

          <form className="register-form">
            <div className="register-row">
              <div className="register-field">
                <label htmlFor="firstName">
                  {isEnglish ? "First Name" : "Ім'я"}
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder={isEnglish ? "First Name" : "Ім'я"}
                  autoComplete="given-name"
                />
              </div>

              <div className="register-field">
                <label htmlFor="lastName">
                  {isEnglish ? "Last Name" : "Прізвище"}
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder={isEnglish ? "Last Name" : "Прізвище"}
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="register-field">
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

            <div className="register-field">
              <label htmlFor="password">
                {isEnglish ? "Password" : "Пароль"}
              </label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder={
                  isEnglish ? "Create a password" : "Створіть пароль"
                }
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="register-button">
              {isEnglish ? "Create Account" : "Створити акаунт"}
            </button>
          </form>

          <div className="register-footer">
            <span>
              {isEnglish ? "Already have an account?" : "Вже маєте акаунт?"}
            </span>

            <Link href="/login">{isEnglish ? "Sign In" : "Увійти"}</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
