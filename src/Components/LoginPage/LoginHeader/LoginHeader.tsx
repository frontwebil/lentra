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
  return (
    <header className="login-header">
      <div className="container login-header-container">
        <Link href={homeHref} className="login-header-logo">
          Lentra
        </Link>

        <div className="login-header-actions">
          <div className="login-header-lang">
            <button
              onClick={() => dispatch(setLanguage("uk"))}
              className={language === "uk" ? "active" : ""}
            >
              UA
            </button>

            <span>/</span>

            <button
              onClick={() => dispatch(setLanguage("en"))}
              className={language === "en" ? "active" : ""}
            >
              EN
            </button>
          </div>

          {pathname == "/register" && (
            <Link href={"/login"} className="login-header-button login">
              Увійти
            </Link>
          )}

          {pathname == "/login" && (
            <Link href={"/register"} className="login-header-button register">
              Реєстрація
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
