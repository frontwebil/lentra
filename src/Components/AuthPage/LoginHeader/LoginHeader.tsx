"use client";

import Link from "next/link";

import "./style.css";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/app/redux/languague/store";
import { setLanguage } from "@/app/redux/languague/languageSlice";
import { usePathname } from "next/navigation";

export function LoginHeader() {
  const pathname = usePathname();

  const { language } = useSelector((store: RootState) => store.language);
  const dispatch = useDispatch();

  const homeHref = language === "en" ? "/en" : "/";

  const changeLanguage = (language: "uk" | "en") => {
    dispatch(setLanguage(language));
    localStorage.setItem("language", language);
  };

  return (
    <header className="login-header">
      <div className="container login-header-container">
        <Link href={homeHref} className="login-header-logo">
          Lentra
        </Link>

        <div className="login-header-actions">
          <div className="login-header-lang">
            <button
              onClick={() => changeLanguage("uk")}
              className={language === "uk" ? "active" : ""}
            >
              UA
            </button>

            <span>/</span>

            <button
              onClick={() => changeLanguage("en")}
              className={language === "en" ? "active" : ""}
            >
              EN
            </button>
          </div>

          {pathname == "/register" && (
            <Link href={"/login"} className="login-header-button login">
              {language == "en" ? "Sign In" : "Увійти"}
            </Link>
          )}

          {pathname == "/login" && (
            <Link href={"/register"} className="login-header-button register">
              {language == "en" ? "Sign Up" : "Зареєструватись"}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
