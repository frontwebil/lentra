import Link from "next/link";
import "./style.css";

export function Header() {
  return (
    <header>
      <div className="container">
        <Link href={"/"} className="header-logo">
          Lentra
        </Link>
        <nav className="header-nav">
          <a href="#possibility" className="header-nav-link">
            Можливості
          </a>
          <a href="#how-it-works" className="header-nav-link">
            Як це працює
          </a>
          <a href="#api" className="header-nav-link">
            API
          </a>
          <a href="#faq" className="header-nav-link">
            FAQ
          </a>
        </nav>
        <div className="header-buttons">
          <button className="header-button login">Увійти</button>
          <button className="header-button register">
            Спробувати безкоштовно
          </button>
        </div>
      </div>
    </header>
  );
}
