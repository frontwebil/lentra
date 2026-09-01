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
          <a href="" className="header-nav-link">Text 1</a>
          <a href="" className="header-nav-link">Text 2</a>
          <a href="" className="header-nav-link">Text 3</a>
          <a href="" className="header-nav-link">Text 4</a>
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
