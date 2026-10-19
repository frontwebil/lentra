"use client";

import { Lead, Website } from "@/generated/prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import "./style.css";

type LeadField = {
  key: string;
  label?: string;
};

type WebsiteWithLeads = Website & {
  leads: Lead[];
};

export function LeedsPage({ website }: { website: WebsiteWithLeads }) {
  const { data: session } = useSession();
  const language = session?.user?.language || "uk";

  const schema = Array.isArray(website.leadSchema)
    ? (website.leadSchema as unknown as LeadField[])
    : [];

  const [visibleKeys, setVisibleKeys] = useState<string[]>(() =>
    schema.map((f) => f.key),
  );

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleColumn = (key: string) => {
    setVisibleKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
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
                {website.websiteName}
              </h1>
              <Link
                href={website.websiteUrl}
                className="dashboard-page-description"
                target="_blank"
              >
                {website.websiteUrl}
              </Link>
            </div>
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
            {website.leads?.length ? (
              <table className="leads-overview-table">
                <thead>
                  <tr>
                    <th>{language === "en" ? "Status" : "Статус"}</th>

                    {visibleSchema.map((field) => (
                      <th key={field.key}>{field.label || field.key}</th>
                    ))}

                    <th>{language === "en" ? "Created At" : "Створено"}</th>
                    <th>{language === "en" ? "Updated At" : "Оновлено"}</th>
                  </tr>
                </thead>
                <tbody>
                  {website.leads.map((lead) => {
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

                        {visibleSchema.map((field) => (
                          <td key={field.key}>
                            {fields[field.key] !== undefined &&
                            fields[field.key] !== ""
                              ? String(fields[field.key])
                              : "—"}
                          </td>
                        ))}

                        <td className="leads-date">
                          {formatDate(lead.createdAt)}
                        </td>
                        <td className="leads-date">
                          {formatDate(lead.updatedAt)}
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
    </div>
  );
}
