import Link from "next/link";
import type { Dictionary } from "@/dictionaries/uk";
import "./style.css";

type Props = {
  dict: Dictionary["header"];
  locale: "uk" | "en";
};

export function Header({ dict, locale }: Props) {
  const homeHref = locale === "en" ? "/en" : "/";

  return (
    <header>
      <div className="container">
        <Link href={homeHref} className="header-logo">
          Lentra
        </Link>
        <nav className="header-nav">
          {dict.nav.map((link) => (
            <a href={link.href} className="header-nav-link" key={link.href}>
              {link.label}
            </a>
          ))}
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
          <button className="header-button login">{dict.login}</button>
          <button className="header-button register">{dict.register}</button>
        </div>
      </div>
    </header>
  );
}
