import Link from "next/link";
import { LuMail, LuSend } from "react-icons/lu";
import "./style.css";

const columns = [
  {
    title: "Продукт",
    links: [
      { label: "Можливості", href: "#possibility" },
      { label: "Як це працює", href: "#how-it-works" },
      { label: "API", href: "#api" },
    ],
  },
  {
    title: "Підтримка",
    links: [
      { label: "Документація", href: "#api" },
      { label: "Поширені запитання", href: "#faq" },
      { label: "Замовити консультацію", href: "#consultation" },
    ],
  },
  {
    title: "Компанія",
    links: [
      { label: "Про Lentra", href: "#" },
      { label: "Умови використання", href: "#" },
      { label: "Політика конфіденційності", href: "#" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="footer-logo">
              Lentra
            </Link>
            <p className="footer-brand-text">
              CRM для заявок: приймайте звернення з сайту, керуйте клієнтами та
              не втрачайте жодної заявки.
            </p>
            <div className="footer-contacts">
              <a href="mailto:hello@lentra.tech" className="footer-contact">
                <LuMail /> hello@lentra.tech
              </a>
              <a
                href="https://t.me/"
                className="footer-contact"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LuSend /> Telegram
              </a>
            </div>
          </div>

          <div className="footer-columns">
            {columns.map((col) => (
              <div className="footer-column" key={col.title}>
                <h3 className="footer-column-title">{col.title}</h3>
                <ul className="footer-column-links">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {year} Lentra. Усі права захищені.</p>
          <a href="#consultation" className="footer-bottom-link">
            Замовити консультацію →
          </a>
        </div>
      </div>
    </footer>
  );
}
