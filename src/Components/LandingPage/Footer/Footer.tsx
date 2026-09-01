import Link from "next/link";
import { LuMail, LuSend } from "react-icons/lu";
import type { Dictionary } from "@/dictionaries/uk";
import "./style.css";

type Props = {
  dict: Dictionary["footer"];
  locale: "uk" | "en";
};

export function Footer({ dict, locale }: Props) {
  const year = new Date().getFullYear();
  const homeHref = locale === "en" ? "/en" : "/";

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Link href={homeHref} className="footer-logo">
              Lentra
            </Link>
            <p className="footer-brand-text">{dict.brandText}</p>
            <div className="footer-contacts">
              <a href="mailto:lentra.crm@gmail.com" className="footer-contact">
                <LuMail /> lentra.crm@gmail.com
              </a>
              <a
                href="https://t.me/iLyhaha1"
                className="footer-contact"
                target="_blank"
                rel="noopener noreferrer"
              >
                <LuSend />
                Telegram
              </a>
            </div>
          </div>

          <div className="footer-columns">
            {dict.columns.map((col) => (
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
          <p>
            © {year} Lentra. {dict.rights}
          </p>
          <a href="#consultation" className="footer-bottom-link">
            {dict.consultationLink}
          </a>
        </div>
      </div>
    </footer>
  );
}
