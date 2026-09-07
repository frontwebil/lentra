"use client";

import Link from "next/link";
import "./style.css";

import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/languague/store";

import { useEffect, useState } from "react";

import axios from "axios";
import { toast } from "sonner";

import { setLanguage } from "@/app/redux/languague/languageSlice";

import { FaEye, FaEyeSlash, FaCheck } from "react-icons/fa";

import { VerifyEmail } from "../VerifyEmail/Verify";

type RegisterStep = 1 | 2;

export function Register() {
  const { language } = useSelector((store: RootState) => store.language);

  const dispatch = useDispatch();

  const [step, setStep] = useState<RegisterStep>(1);

  const [registeredEmail, setRegisteredEmail] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEnglish = language === "en";

  const [formData, setFormData] = useState({
    phone: "",
    companyName: "",
    password: "",
    email: "",
    language: language || "uk",
  });

  useEffect(() => {
    if (!language) {
      const savedLanguage = localStorage.getItem("language");

      if (savedLanguage === "en" || savedLanguage === "uk") {
        dispatch(setLanguage(savedLanguage));

        setFormData((prev) => ({
          ...prev,
          language: savedLanguage,
        }));
      } else {
        dispatch(setLanguage("en"));

        setFormData((prev) => ({
          ...prev,
          language: "en",
        }));
      }
    }
  }, [language, dispatch]);

  const handleFirstStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.phone.trim()) {
      toast(isEnglish ? "Enter your phone number" : "Введіть номер телефону");
      return;
    }

    if (formData.companyName.trim().length < 2) {
      toast(
        isEnglish
          ? "Company name must be at least 2 characters"
          : "Назва компанії має містити мінімум 2 символи",
      );
      return;
    }

    if (!formData.password) {
      toast(isEnglish ? "Enter your password" : "Введіть пароль");
      return;
    }

    if (formData.password.length < 8) {
      toast(
        isEnglish
          ? "Password must be at least 8 characters"
          : "Пароль має містити мінімум 8 символів",
      );
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    if (!formData.email.trim()) {
      toast(isEnglish ? "Enter your email" : "Введіть електронну пошту");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(formData.email)) {
      toast(
        isEnglish ? "Enter a valid email" : "Введіть коректну електронну пошту",
      );
      return;
    }

    setLoading(true);

    try {
      await axios.post("/api/User/create-user", {
        phone: formData.phone,
        companyName: formData.companyName,
        password: formData.password,
        email: formData.email,
        language: formData.language,
      });

      setRegisteredEmail(formData.email);

      toast.success(
        isEnglish ? "Account created successfully" : "Акаунт успішно створено",
      );

      setFormData({
        phone: "",
        companyName: "",
        password: "",
        email: "",
        language: language || "uk",
      });
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

        if (error.response?.status === 409) {
          toast.error(
            isEnglish
              ? "Email already exists"
              : "Така пошта вже зареєстрована.",
          );

          return;
        }

        if (error.response?.status === 408) {
          toast.error(
            isEnglish
              ? "Phone number already exists"
              : "Такий номер телефону вже зареєстрований.",
          );

          return;
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

  const handleLanguageChange = (value: "uk" | "en") => {
    setFormData((prev) => ({
      ...prev,
      language: value,
    }));
  };

  return (
    <main className="register">
      {loading && <div className="page-loader" />}

      <div className="register-container">
        <div className="register-card">
          {loading && (
            <div className="widget-loader">
              <div className="loader" />
            </div>
          )}

          {registeredEmail ? (
            <VerifyEmail email={registeredEmail} isEnglish={isEnglish} />
          ) : (
            <>
              <div className="register-header">
                <h1 className="register-title">
                  {isEnglish ? "Create your account" : "Створіть акаунт"}
                </h1>

                <p className="register-description">
                  {step === 1
                    ? isEnglish
                      ? "Set up your Lentra workspace"
                      : "Налаштуйте свій простір Lentra"
                    : isEnglish
                      ? "Almost there"
                      : "Майже готово"}
                </p>

                <div className="register-progress">
                  <div
                    className={`register-progress-item ${
                      step >= 1 ? "active" : ""
                    }`}
                  >
                    <span>1</span>
                  </div>

                  <div
                    className={`register-progress-line ${
                      step === 2 ? "active" : ""
                    }`}
                  />

                  <div
                    className={`register-progress-item ${
                      step === 2 ? "active" : ""
                    }`}
                  >
                    <span>2</span>
                  </div>
                </div>
              </div>

              {step === 1 ? (
                <form className="register-form" onSubmit={handleFirstStep}>
                  <div className="register-field">
                    <label htmlFor="phone">
                      {isEnglish ? "Phone number" : "Номер телефону"}
                    </label>

                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+380 00 000 00 00"
                      autoComplete="tel"
                      required
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="register-field">
                    <label htmlFor="companyName">
                      {isEnglish ? "Company name" : "Назва компанії"}
                    </label>

                    <input
                      id="companyName"
                      name="companyName"
                      type="text"
                      placeholder={
                        isEnglish
                          ? "Enter your company name"
                          : "Введіть назву компанії"
                      }
                      autoComplete="organization"
                      required
                      value={formData.companyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          companyName: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="register-field">
                    <label htmlFor="password">
                      {isEnglish ? "Password" : "Пароль"}
                    </label>

                    <div className="register-field-password-wrap">
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        placeholder={
                          isEnglish ? "Create a password" : "Створіть пароль"
                        }
                        autoComplete="new-password"
                        value={formData.password}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          })
                        }
                      />

                      <button
                        type="button"
                        className="register-field-password-wrap-button-show"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <FaEye /> : <FaEyeSlash />}
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="register-button">
                    {isEnglish ? "Continue" : "Продовжити"}
                  </button>
                </form>
              ) : (
                <form className="register-form" onSubmit={handleSubmit}>
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
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          email: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="register-field">
                    <label>{isEnglish ? "CRM language" : "Мова CRM"}</label>

                    <div className="register-language">
                      <button
                        type="button"
                        className={
                          formData.language === "uk"
                            ? "register-language-option active"
                            : "register-language-option"
                        }
                        onClick={() => handleLanguageChange("uk")}
                      >
                        <span className="register-language-flag">🇺🇦</span>

                        <span className="register-language-name">
                          Українська
                        </span>

                        {formData.language === "uk" && (
                          <span className="register-language-check">
                            <FaCheck />
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        className={
                          formData.language === "en"
                            ? "register-language-option active"
                            : "register-language-option"
                        }
                        onClick={() => handleLanguageChange("en")}
                      >
                        <span className="register-language-flag">🇬🇧</span>

                        <span className="register-language-name">English</span>

                        {formData.language === "en" && (
                          <span className="register-language-check">
                            <FaCheck />
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="register-buttons">
                    <button
                      type="button"
                      className="register-button-back"
                      onClick={() => setStep(1)}
                      disabled={loading}
                    >
                      {isEnglish ? "Back" : "Назад"}
                    </button>

                    <button
                      type="submit"
                      className="register-button"
                      disabled={loading}
                    >
                      {isEnglish ? "Create Account" : "Створити акаунт"}
                    </button>
                  </div>
                </form>
              )}

              <div className="register-footer">
                <span>
                  {isEnglish ? "Already have an account?" : "Вже маєте акаунт?"}
                </span>

                <Link href="/login">{isEnglish ? "Sign In" : "Увійти"}</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
