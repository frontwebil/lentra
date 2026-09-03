"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Dictionary } from "@/dictionaries/uk";
import "./style.css";
import { useDispatch } from "react-redux";
import { setLanguage } from "@/app/redux/languague/languageSlice";

type Props = {
  dict: Dictionary["header"];
  locale: "uk" | "en";
};

export function Header({ dict, locale }: Props) {
  const homeHref = locale === "en" ? "/en" : "/";
  const [menuOpen, setMenuOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setLanguage(locale));
  }, [locale]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header>
      <div className="container">
        <Link href={homeHref} className="header-logo">
          Lentra
        </Link>
        <nav className={`header-nav${menuOpen ? " open" : ""}`}>
          {dict.nav.map((link) => (
            <a
              href={link.href}
              className="header-nav-link"
              key={link.href}
              onClick={closeMenu}
            >
              {link.label}
            </a>
          ))}
          <div className="lang-switcher lang-switcher-mobile">
            <Link
              href="/"
              className={locale === "uk" ? "active" : ""}
              onClick={closeMenu}
            >
              UA
            </Link>
            <span className="lang-switcher-divider">/</span>
            <Link
              href="/en"
              className={locale === "en" ? "active" : ""}
              onClick={closeMenu}
            >
              EN
            </Link>
          </div>
          <div className="header-nav-mobile-buttons">
            <button className="header-button login">{dict.login}</button>
            <button className="header-button register">{dict.register}</button>
          </div>
        </nav>
        <div className="header-buttons">
          <div className="lang-switcher">
            <Link href="/" className={locale === "uk" ? "active" : ""}>
              UA
            </Link>
            <span className="lang-switcher-divider">/</span>
            <Link href="/en" className={locale === "en" ? "active" : ""}>
              EN
            </Link>
          </div>
          <Link href={homeHref} className="header-button login">
            {dict.login}
          </Link>
          <Link href={homeHref} className="header-button register">
            {dict.register}
          </Link>
        </div>
        <button
          className={`header-burger${menuOpen ? " open" : ""}`}
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
