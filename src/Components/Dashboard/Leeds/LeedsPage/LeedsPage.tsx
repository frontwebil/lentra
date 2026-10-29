/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Lead, Website } from "@/generated/prisma/client";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useState, useRef, useEffect, useMemo } from "react";
import { RxPencil1, RxExclamationTriangle } from "react-icons/rx";
import "./style.css";
import { SitesConfigEditModal } from "../../SitesConfig/SitesConfigEditModal";
import { FaEye } from "react-icons/fa";
import { StatusModalEdit } from "./StatusModalEdit/StatusModalEdit";
import { STATUS_COLORS } from "@/dictionaries/status-colors";

type LeadField = {
  key: string;
  label?: string;
};

type StatusItem = {
  id: string;
  name: string;
  colorId: string;
};

type WebsiteWithLeads = Website & {
  leads: Lead[];
};

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

type LeadStatusValue =
  | string
  | { colorId?: string; text?: string; name?: string }
  | null
  | undefined;

export const normalizeLeadStatus = (
  value: unknown,
  language: string,
): { key: string; text: string; colorId: string } => {
  let status: LeadStatusValue = value as LeadStatusValue;

  if (typeof status === "string" && status.trim().startsWith("{")) {
    try {
      status = JSON.parse(status) as LeadStatusValue;
    } catch {
      // Keep the original status string.
    }
  }

  if (typeof status === "object" && status !== null) {
    const originalText = String(status.text ?? status.name ?? "NEW");
    const isNew = originalText.toLowerCase() === "new";

    return {
      key: isNew ? "NEW" : originalText,
      text: isNew ? (language === "en" ? "New" : "Новий") : originalText,
      colorId: String(status.colorId ?? (isNew ? "new" : "gray")),
    };
  }

  const originalText = String(status ?? "NEW");
  const isNew = originalText.toLowerCase() === "new";

  return {
    key: isNew ? "NEW" : originalText,
    text: isNew ? (language === "en" ? "New" : "Новий") : originalText,
    colorId: isNew ? "new" : originalText.toLowerCase(),
  };
};

export function LeedsPage({ website }: { website: WebsiteWithLeads }) {
  const { data: session } = useSession();

  const language = session?.user?.language || "uk";

  const [currentWebsite, setCurrentWebsite] =
    useState<WebsiteWithLeads>(website);

  const [isModalEditOpen, setIsModalEditOpen] = useState(false);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const statuses = (currentWebsite.statuses as StatusItem[] | null) ?? [];

  useEffect(() => {
    setCurrentWebsite(website);
  }, [website]);

  // Формування списку всіх доступних статусів (конфігуровані + "сироти" з реальних заявок)
  const statusOptions = useMemo(() => {
    const configuredNames = new Set([
      "NEW",
      ...statuses.map((status) => status.name),
    ]);

    const statusMap = new Map<
      string,
      { key: string; text: string; count: number; isValid: boolean }
    >();

    // 1. Налаштовані валідні статуси
    configuredNames.forEach((name) => {
      const isNew = name.toLowerCase() === "new";
      const key = isNew ? "NEW" : name;
      const text = isNew ? (language === "en" ? "New" : "Новий") : name;
      statusMap.set(key.toLowerCase(), {
        key,
        text,
        count: 0,
        isValid: true,
      });
    });

    // 2. Аналізуємо реальні заявки на наявність недійсних або застарілих статусів
    (currentWebsite.leads || []).forEach((lead) => {
      const norm = normalizeLeadStatus(lead.status, language);
      const lowerKey = norm.key.toLowerCase();

      if (statusMap.has(lowerKey)) {
        statusMap.get(lowerKey)!.count += 1;
      } else {
        // Статус є в заявці, але його видалили або перейменували в налаштуваннях
        statusMap.set(lowerKey, {
          key: norm.key,
          text: norm.text,
          count: 1,
          isValid: false,
        });
      }
    });

    return Array.from(statusMap.values());
  }, [statuses, currentWebsite.leads, language]);

  const schema = Array.isArray(currentWebsite.leadSchema)
    ? (currentWebsite.leadSchema as unknown as LeadField[])
    : [];

  const [visibleKeys, setVisibleKeys] = useState<string[]>(() =>
    schema.map((field) => field.key),
  );

  const [visibleMetaColumns, setVisibleMetaColumns] = useState<string[]>([
    "createdAt",
    "updatedAt",
  ]);

  const [visibleStatuses, setVisibleStatuses] = useState<string[]>([]);

  useEffect(() => {
    setVisibleStatuses(statusOptions.map((opt) => opt.key));
  }, [statusOptions]);

  const [isOpenField, setIsOpenField] = useState(false);

  const [isOpenStatuses, setIsOpenStatuses] = useState(false);

  const dropdownRefField = useRef<HTMLDivElement>(null);

  const dropdownRefStatuses = useRef<HTMLDivElement>(null);

  const [colWidths, setColWidths] = useState<Record<string, number>>({});

  const dragData = useRef<{
    key: string;
    startX: number;
    startWidth: number;
  } | null>(null);

  const visibleKeysCookieName = `leads_visible_keys_${website.id}`;

  const visibleMetaColumnsCookieName = `leads_visible_meta_columns_${website.id}`;

  const colWidthsCookieName = `leads_col_widths_${website.id}`;

  useEffect(() => {
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

    const savedMetaColumnsJson = getCookie(visibleMetaColumnsCookieName);

    if (savedMetaColumnsJson) {
      try {
        const parsed = JSON.parse(savedMetaColumnsJson);

        if (Array.isArray(parsed)) {
          setVisibleMetaColumns(parsed);
        }
      } catch (e) {
        console.error("Error parsing visible meta columns cookie", e);
      }
    }
  }, [website.id, visibleKeysCookieName, colWidthsCookieName, visibleMetaColumnsCookieName]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRefField.current &&
        !dropdownRefField.current.contains(event.target as Node)
      ) {
        setIsOpenField(false);
      }
    };

    if (isOpenField) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenField]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRefStatuses.current &&
        !dropdownRefStatuses.current.contains(event.target as Node)
      ) {
        setIsOpenStatuses(false);
      }
    };

    if (isOpenStatuses) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpenStatuses]);

  const toggleColumn = (key: string) => {
    setVisibleKeys((prev) => {
      const next = prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key];

      setCookie(visibleKeysCookieName, JSON.stringify(next));

      return next;
    });
  };

  const toggleMetaColumn = (key: string) => {
    setVisibleMetaColumns((prev) => {
      const next = prev.includes(key)
        ? prev.filter((item) => item !== key)
        : [...prev, key];

      setCookie(visibleMetaColumnsCookieName, JSON.stringify(next));
      return next;
    });
  };

  const toggleStatus = (status: string) => {
    setVisibleStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((item) => item.toLowerCase() !== status.toLowerCase())
        : [...prev, status],
    );
  };

  const visibleSchema = schema.filter((field) =>
    visibleKeys.includes(field.key),
  );

  const filteredLeads = currentWebsite.leads.filter((lead) => {
    const status = normalizeLeadStatus(lead.status, language);

    return visibleStatuses.some(
      (visibleStatus) =>
        visibleStatus.toLowerCase() === status.key.toLowerCase() ||
        visibleStatus.toLowerCase() === status.text.toLowerCase(),
    );
  });

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleString(language === "en" ? "en-GB" : "uk-UA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

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
      [key]: Math.max(60, startWidth + diff),
    }));
  };

  const handleMouseUp = () => {
    dragData.current = null;

    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    document.body.classList.remove("is-resizing");

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
            <div className="table-nav-left">
              {schema.length > 0 && (
                <div
                  className="columns-dropdown-wrapper"
                  ref={dropdownRefField}
                >
                  <button
                    type="button"
                    className="table-nav-btn"
                    onClick={() => setIsOpenField((prev) => !prev)}
                  >
                    {language === "en" ? "Columns" : "Колонки"}
                  </button>

                  {isOpenField && (
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

                        {["createdAt", "updatedAt"].map((key) => (
                          <label key={key} className="dropdown-item">
                            <input
                              type="checkbox"
                              checked={visibleMetaColumns.includes(key)}
                              onChange={() => toggleMetaColumn(key)}
                            />

                            <span>
                              {key === "createdAt"
                                ? language === "en"
                                  ? "Created At"
                                  : "Створено"
                                : language === "en"
                                  ? "Updated At"
                                  : "Оновлено"}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div
                className="columns-statuses-wrapper"
                ref={dropdownRefStatuses}
              >
                <button
                  type="button"
                  className="table-nav-btn"
                  style={{ textAlign: "center" }}
                  onClick={() => setIsOpenStatuses((prev) => !prev)}
                >
                  {language === "en" ? "Statuses" : "Статуси"}
                </button>

                {isOpenStatuses && (
                  <div className="columns-dropdown-menu">
                    <div className="dropdown-title">
                      {language === "en" ? "Statuses" : "Статуси"}
                    </div>

                    <div className="dropdown-list">
                      {statusOptions.map((opt) => (
                        <label
                          key={opt.key}
                          className="dropdown-item"
                          style={
                            !opt.isValid
                              ? {
                                  backgroundColor: "#fffbeb",
                                  borderRadius: "4px",
                                  padding: "2px 6px",
                                }
                              : undefined
                          }
                        >
                          <input
                            type="checkbox"
                            checked={visibleStatuses.some(
                              (vs) =>
                                vs.toLowerCase() === opt.key.toLowerCase(),
                            )}
                            onChange={() => toggleStatus(opt.key)}
                          />

                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                              width: "100%",
                              justifyContent: "space-between",
                            }}
                          >
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px",
                              }}
                            >
                              {opt.text}
                              {!opt.isValid && (
                                <span
                                  title={
                                    language === "en"
                                      ? "Status not found in site configuration. Needs update."
                                      : "Статус відсутній в налаштуваннях сайту. Потребує оновлення."
                                  }
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    color: "#d97706",
                                  }}
                                >
                                  <RxExclamationTriangle />
                                </span>
                              )}
                            </span>

                            {opt.count > 0 && (
                              <span
                                style={{
                                  fontSize: "11px",
                                  opacity: 0.6,
                                  marginLeft: "auto",
                                }}
                              >
                                ({opt.count})
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="table-nav-right">
              <button
                className="table-nav-btn"
                onClick={() => setIsStatusModalOpen(true)}
              >
                {language === "en" ? "Manage statuses" : "Налаштувати статуси"}
              </button>
            </div>
          </div>

          <div className="dashboard-surface leads-table-wrapper">
            {filteredLeads.length > 0 ? (
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

                    {visibleMetaColumns.includes("createdAt") && (
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
                    )}

                    {visibleMetaColumns.includes("updatedAt") && (
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
                    )}

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
                  {filteredLeads.map((lead) => {
                    const fields = (lead.fields as Record<string, any>) || {};

                    const status = normalizeLeadStatus(lead.status, language);

                    const statusColor = STATUS_COLORS.find(
                      (item) => item.id === status.colorId,
                    );

                    const isStatusValid =
                      status.key.toLowerCase() === "new" ||
                      statuses.some(
                        (s) =>
                          s.name.toLowerCase() === status.key.toLowerCase(),
                      );

                    return (
                      <tr key={lead.id}>
                        <td className="lead-cell-text">
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "6px",
                            }}
                          >
                            <span
                              className={`status-badge ${status.colorId}`}
                              style={
                                statusColor
                                  ? {
                                      background: statusColor.bg,
                                      color: statusColor.text,
                                    }
                                  : !isStatusValid
                                    ? {
                                        background: "#fef3c7",
                                        color: "#b45309",
                                        border: "1px dashed #f59e0b",
                                      }
                                    : undefined
                              }
                            >
                              {status.text}
                            </span>

                            {!isStatusValid && (
                              <span
                                title={
                                  language === "en"
                                    ? "Unmapped status! Not found in site configuration."
                                    : "Застарілий/неузгоджений статус! Відсутній у налаштуваннях сайту."
                                }
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  color: "#d97706",
                                  fontSize: "14px",
                                }}
                              >
                                <RxExclamationTriangle />
                              </span>
                            )}
                          </div>
                        </td>

                        {visibleSchema.map((field) => {
                          const cellValue =
                            fields[field.key] !== undefined &&
                            fields[field.key] !== ""
                              ? String(fields[field.key])
                              : "—";

                          return (
                            <td key={field.key}>
                              <span className="lead-cell-text">
                                {cellValue}
                              </span>
                            </td>
                          );
                        })}

                        {visibleMetaColumns.includes("createdAt") && (
                          <td className="leads-date">
                          <span className="lead-cell-text">
                            {formatDate(lead.createdAt)}
                          </span>
                          </td>
                        )}

                        {visibleMetaColumns.includes("updatedAt") && (
                          <td className="leads-date">
                          <span className="lead-cell-text">
                            {formatDate(lead.updatedAt)}
                          </span>
                          </td>
                        )}

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
                  {currentWebsite.leads.length === 0
                    ? language === "en"
                      ? "No leads received yet."
                      : "Ще немає отриманих заявок."
                    : language === "en"
                      ? "No leads match the selected statuses."
                      : "Немає заявок із вибраними статусами."}
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

      {isStatusModalOpen && (
        <StatusModalEdit
          key={currentWebsite.id}
          language={language}
          setIsStatusModalOpen={setIsStatusModalOpen}
          websiteStatuses={statuses}
          website={currentWebsite}
          setCurrentStatuses={(newStatuses: StatusItem[]) =>
            setCurrentWebsite((prev) => ({
              ...prev,
              statuses: newStatuses,
            }))
          }
        />
      )}
    </div>
  );
}
