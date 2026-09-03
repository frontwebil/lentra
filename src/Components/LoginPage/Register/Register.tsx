"use client";

import Link from "next/link";

import "./style.css";

import { useDispatch, useSelector } from "react-redux";

import { RootState } from "@/app/redux/languague/store";
import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { setLanguage } from "@/app/redux/languague/languageSlice";

export function Register() {
  const { language } = useSelector((store: RootState) => store.language);

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

  const [loading, setLoading] = useState(false);
  const isEnglish = language === "en";

  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    if (formData.name.trim().length < 3) {
      toast(
        isEnglish
          ? "Name must be at least 3 characters"
          : "Ім'я має містити мінімум 3 символи",
      );
      setLoading(false);
      return;
    }

    if (formData.surname.trim().length < 3) {
      toast(
        isEnglish
          ? "Surname must be at least 3 characters"
          : "Прізвище має містити мінімум 3 символи",
      );
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      toast(isEnglish ? "Enter your email" : "Введіть електронну пошту");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      toast(
        isEnglish ? "Enter a valid email" : "Введіть коректну електронну пошту",
      );
      setLoading(false);
      return;
    }

    if (!formData.password) {
      toast(isEnglish ? "Enter your password" : "Введіть пароль");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast(
        isEnglish
          ? "Password must be at least 8 characters"
          : "Пароль має містити мінімум 8 символів",
      );
      setLoading(false);
      return;
    }
    try {
      await axios.post("/api/User/create-user", formData);

      toast.success(
        isEnglish ? "Account created successfully" : "Акаунт успішно створено",
      );
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

        console.log(error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 409) {
            toast.error(
              isEnglish
                ? "Email already exists"
                : "Така пошта вже зареєстрована.",
            );

            return;
          }
        }

        toast.error(
          error.response?.data?.message ||
            (isEnglish ? "Something went wrong" : "Сталася помилка"),
        );
      }
    } finally {
      setLoading(false);
    }
  };

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

          <form className="register-form" onSubmit={handleSubmit}>
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
                  required
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value });
                  }}
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
                  required
                  value={formData.surname}
                  onChange={(e) => {
                    setFormData({ ...formData, surname: e.target.value });
                  }}
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder={
                  isEnglish ? "Enter your email" : "Введіть ваш email"
                }
                autoComplete="email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({ ...formData, email: e.target.value });
                }}
              />
            </div>

            <div className="register-field">
              <label htmlFor="password">
                {isEnglish ? "Password" : "Пароль"}
              </label>
              <div className="">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder={
                    isEnglish ? "Create a password" : "Створіть пароль"
                  }
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(e) => {
                    setFormData({ ...formData, password: e.target.value });
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              className="register-button"
              disabled={loading}
            >
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
