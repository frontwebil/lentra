/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Lead, Website } from "@/generated/prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { RxPencil1 } from "react-icons/rx";
import "./style.css";
import { SitesConfigEditModal } from "../../SitesConfig/SitesConfigEditModal";
import { FaEye } from "react-icons/fa";

type LeadField = {
  key: string;
  label?: string;
};

type WebsiteWithLeads = Website & {
  leads: Lead[];
};

// Хелпери для роботи з Cookie
const setCookie = (name: string, value: string, days = 365) => {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string => {
  if (typeof document === "undefined") return "";
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1] || "") : r;
  }, "");
};

export function LeedsPage({ website }: { website: WebsiteWithLeads }) {
  const { data: session } = useSession();
  const language = session?.user?.language || "uk";

  const [currentWebsite, setCurrentWebsite] =
    useState<WebsiteWithLeads>(website);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);

  useEffect(() => {
    setCurrentWebsite(website);
  }, [website]);

  const schema = Array.isArray(currentWebsite.leadSchema)
    ? (currentWebsite.leadSchema as unknown as LeadField[])
    : [];

  const [visibleKeys, setVisibleKeys] = useState<string[]>(() =>
    schema.map((f) => f.key),
  );

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Стейт та реф для ширини колонок
  const [colWidths, setColWidths] = useState<Record<string, number>>({});
  const dragData = useRef<{
    key: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  // Ключі для Cookie на основі ID сайту
  const visibleKeysCookieName = `leads_visible_keys_${website.id}`;
  const colWidthsCookieName = `leads_col_widths_${website.id}`;

  // 1. Читання з Cookie при маунті (hydration-safe)
  useEffect(() => {
    // Зчитуємо видимі колонки
    const savedKeysJson = getCookie(visibleKeysCookieName);
    if (savedKeysJson) {
      try {
        const parsed = JSON.parse(savedKeysJson);
        if (Array.isArray(parsed)) {
          setVisibleKeys(parsed);
        }
      } catch (e) {
        console.error("Error parsing visible keys cookie", e);
      }
    }

    // Зчитуємо ширину колонок
    const savedWidthsJson = getCookie(colWidthsCookieName);
    if (savedWidthsJson) {
      try {
        const parsed = JSON.parse(savedWidthsJson);
        if (typeof parsed === "object" && parsed !== null) {
          setColWidths(parsed);
        }
      } catch (e) {
        console.error("Error parsing column widths cookie", e);
      }
    }
  }, [website.id, visibleKeysCookieName, colWidthsCookieName]);

  // Закриття дропдауну при кліку ззовні
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Перемикання колонок та збереження в Cookie
  const toggleColumn = (key: string) => {
    setVisibleKeys((prev) => {
      const next = prev.includes(key)
        ? prev.filter((k) => k !== key)
        : [...prev, key];

      setCookie(visibleKeysCookieName, JSON.stringify(next));
      return next;
    });
  };

  const visibleSchema = schema.filter((field) =>
    visibleKeys.includes(field.key),
  );

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleString(language === "en" ? "en-US" : "uk-UA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Логіка зміни розміру колонок
  const handleMouseDown = (e: React.MouseEvent, key: string) => {
    e.preventDefault();
    const th = (e.currentTarget as HTMLElement).closest("th");
    if (!th) return;

    dragData.current = {
      key,
      startX: e.clientX,
      startWidth: th.getBoundingClientRect().width,
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.body.classList.add("is-resizing");
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragData.current) return;
    const { key, startX, startWidth } = dragData.current;
    const diff = e.clientX - startX;

    setColWidths((prev) => ({
      ...prev,
      [key]: Math.max(60, startWidth + diff), // Мін. ширина: 60px
    }));
  };

  const handleMouseUp = () => {
    dragData.current = null;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
    document.body.classList.remove("is-resizing");

    // Зберігаємо оновлені ширини в Cookie при завершенні drag-and-drop
    setColWidths((latestWidths) => {
      setCookie(colWidthsCookieName, JSON.stringify(latestWidths));
      return latestWidths;
    });
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.classList.remove("is-resizing");
    };
  }, []);

  return (
    <div className="dashboard-page leads-overview-page">
      {!session ? (
        <div className="widget-loader">
          <div className="loader" style={{ borderTopColor: "#000" }} />
        </div>
      ) : (
        <>
          <div className="leads-overview-top">
            <div>
              <h1 className="dashboard-page-title dashboard-semibold">
                {currentWebsite.websiteName}
              </h1>
              <Link
                href={currentWebsite.websiteUrl}
                className="dashboard-page-description"
                target="_blank"
              >
                {currentWebsite.websiteUrl}
              </Link>
            </div>

            <button
              className="dashboard-primary-button dashboard-primary-button-standard"
              onClick={() => setIsModalEditOpen(true)}
            >
              <RxPencil1 />
              <span>
                {language === "en" ? "Edit website" : "Редагувати сайт"}
              </span>
            </button>
          </div>

          <div className="table-nav">
            {schema.length > 0 && (
              <div className="columns-dropdown-wrapper" ref={dropdownRef}>
                <button
                  type="button"
                  className="columns-trigger-btn"
                  onClick={() => setIsOpen((prev) => !prev)}
                >
                  {language === "en" ? "Columns" : "Колонки"}
                </button>

                {isOpen && (
                  <div className="columns-dropdown-menu">
                    <div className="dropdown-title">
                      {language === "en" ? "Columns" : "Відображати поля"}
                    </div>
                    <div className="dropdown-list">
                      {schema.map((field) => (
                        <label key={field.key} className="dropdown-item">
                          <input
                            type="checkbox"
                            checked={visibleKeys.includes(field.key)}
                            onChange={() => toggleColumn(field.key)}
                          />
                          <span>{field.label || field.key}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="dashboard-surface leads-table-wrapper">
            {currentWebsite.leads?.length ? (
              <table className="leads-overview-table">
                <thead>
                  <tr>
                    <th
                      style={{
                        width: colWidths["status"]
                          ? `${colWidths["status"]}px`
                          : "120px",
                      }}
                    >
                      {language === "en" ? "Status" : "Статус"}
                      <div
                        className="resizer"
                        onMouseDown={(e) => handleMouseDown(e, "status")}
                      />
                    </th>

                    {visibleSchema.map((field) => (
                      <th
                        key={field.key}
                        style={{
                          width: colWidths[field.key]
                            ? `${colWidths[field.key]}px`
                            : "auto",
                        }}
                      >
                        {field.label || field.key}
                        <div
                          className="resizer"
                          onMouseDown={(e) => handleMouseDown(e, field.key)}
                        />
                      </th>
                    ))}

                    <th
                      style={{
                        width: colWidths["createdAt"]
                          ? `${colWidths["createdAt"]}px`
                          : "140px",
                      }}
                    >
                      {language === "en" ? "Created At" : "Створено"}
                      <div
                        className="resizer"
                        onMouseDown={(e) => handleMouseDown(e, "createdAt")}
                      />
                    </th>

                    <th
                      style={{
                        width: colWidths["updatedAt"]
                          ? `${colWidths["updatedAt"]}px`
                          : "140px",
                      }}
                    >
                      {language === "en" ? "Updated At" : "Оновлено"}
                      <div
                        className="resizer"
                        onMouseDown={(e) => handleMouseDown(e, "updatedAt")}
                      />
                    </th>

                    {/* Колонка дій */}
                    <th
                      style={{
                        width: colWidths["actions"]
                          ? `${colWidths["actions"]}px`
                          : "120px",
                      }}
                    >
                      {language === "en" ? "Actions" : "Дії"}
                      <div
                        className="resizer"
                        onMouseDown={(e) => handleMouseDown(e, "actions")}
                      />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {currentWebsite.leads.map((lead) => {
                    const fields = (lead.fields as Record<string, any>) || {};

                    return (
                      <tr key={lead.id}>
                        <td>
                          <span
                            className={`status-badge ${lead.status.toLowerCase()}`}
                          >
                            {lead.status}
                          </span>
                        </td>

                        {visibleSchema.map((field) => {
                          const cellValue =
                            fields[field.key] !== undefined &&
                            fields[field.key] !== ""
                              ? String(fields[field.key])
                              : "—";

                          return <td key={field.key}>{cellValue}</td>;
                        })}

                        <td className="leads-date">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="leads-date">
                          {formatDate(lead.updatedAt)}
                        </td>

                        {/* Кнопка переходу на деталі ліда */}
                        <td>
                          <Link
                            href={`/dashboard/lead/${lead.id}`}
                            className="dashboard-primary-button dashboard-primary-button-standard"
                            style={{
                              padding: "6px 12px",
                              fontSize: "13px",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              textDecoration: "none",
                            }}
                          >
                            <FaEye />
                            <span>
                              {language === "en" ? "View" : "Переглянути"}
                            </span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="dashboard-empty-state">
                <p>
                  {language === "en"
                    ? "No leads received yet."
                    : "Ще немає отриманих заявок."}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {isModalEditOpen && (
        <SitesConfigEditModal
          setIsModalEditOpen={setIsModalEditOpen}
          language={language === "en" ? "en" : "uk"}
          loading={false}
          setWebsites={(action) => {
            if (typeof action === "function") {
              const updatedList = action([currentWebsite]);
              if (updatedList[0]) {
                setCurrentWebsite((prev) => ({
                  ...prev,
                  ...updatedList[0],
                }));
              }
            }
          }}
          website={currentWebsite}
        />
      )}
    </div>
  );
}
