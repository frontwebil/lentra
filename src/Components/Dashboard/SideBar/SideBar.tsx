"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import "./style.css";

import {
  RxHamburgerMenu,
  RxDashboard,
  RxPerson,
  RxGear,
  RxGlobe,
  RxExit,
  RxLink2,
} from "react-icons/rx";
import { usePathname } from "next/navigation";

export function SideBar() {
  const [isOpen, setIsOpen] = useState(true);
  const { data: session } = useSession();
  const pathname = usePathname();

  const language = session?.user.language;
  const companyName = session?.user.companyName;

  const navigation = [
    {
      href: "/dashboard",
      icon: <RxDashboard />,
      label: language === "en" ? "Dashboard" : "Дашборд",
    },
    {
      href: "/leads",
      icon: <RxPerson />,
      label: language === "en" ? "Leads" : "Заявки",
    },
    {
      href: "/sites",
      icon: <RxGlobe />,
      label: language === "en" ? "Sites" : "Сайти",
    },
    {
      href: "/settings",
      icon: <RxLink2 />,
      label: language === "en" ? "Connect Leads" : "Підключити заявки",
    },
  ];

  return (
    <>
      <div className={`padding-left-sidebar ${!isOpen && "close"}`}></div>
      <aside className={`side-bar ${isOpen ? "open" : "closed"}`}>
        <div>
          <div className="side-bar-top">
            {isOpen && (
              <h3 className="side-bar-top-company-name">{companyName}</h3>
            )}

            <button
              className="side-bar-menu-button"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle sidebar"
            >
              <RxHamburgerMenu />
            </button>
          </div>

          <nav className="side-bar-nav">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`side-bar-nav-item ${pathname == item.href && "active"}`}
              >
                <span className="side-bar-nav-icon">{item.icon}</span>

                {isOpen && (
                  <span className="side-bar-nav-label">{item.label}</span>
                )}
              </Link>
            ))}
          </nav>
        </div>

        <div className="side-bard-buttons">
          <Link href="/profile" className="side-bar-button">
            <span className="side-bar-button-icon">
              <RxGear />
            </span>

            {isOpen && (
              <span>{language === "en" ? "Setting" : "Налаштування"}</span>
            )}
          </Link>

          <button
            className="side-bar-button side-bar-logout"
            onClick={() => signOut()}
          >
            <span className="side-bar-button-icon">
              <RxExit />
            </span>
            {isOpen && <span>{language === "en" ? "Sign Out" : "Вийти"}</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
