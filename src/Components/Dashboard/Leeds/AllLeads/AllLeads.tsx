"use client";

import { STATUS_COLORS } from "@/dictionaries/status-colors";
import type { LeadContactSummary } from "@/lib/lead-fields";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { RxChevronLeft, RxChevronRight, RxGlobe } from "react-icons/rx";
import {
  ClientDiscountBadge,
  LeadSearchInput,
} from "../LeadSearch/LeadSearchInput";
import { normalizeLeadStatus } from "../LeedsPage/LeedsPage";
import "../LeedsPage/style.css";
import "../style.css";
import "./style.css";

export type AllLeadsRow = {
  id: string;
  createdAt: string;
  isNew: boolean;
  status: unknown;
  website: { xSiteId: string; name: string; url: string } | null;
  summary: LeadContactSummary;
  client: {
    id: string;
    name: string;
    phone: string | null;
    discountPercent: number | null;
  } | null;
};

export type AllLeadsStatusOption = { name: string; colorId: string };

type Props = {
  rows: AllLeadsRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  query: string;
  selectedSite: string;
  selectedStatus: string;
  websites: { xSiteId: string; name: string }[];
  statusOptions: AllLeadsStatusOption[];
};

export function AllLeads({
  rows,
  total,
  page,
  pageSize,
  totalPages,
  query,
  selectedSite,
  selectedStatus,
  websites,
  statusOptions,
}: Props) {
  const { data: session } = useSession();
  const language = session?.user?.language === "en" ? "en" : "uk";
  const en = language === "en";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const hrefWith = (changes: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const setFilter = (key: "site" | "status", value: string) => {
    startTransition(() => {
      router.replace(hrefWith({ [key]: value || null, page: null }), {
        scroll: false,
      });
    });
  };

  const formatDate = (date: string) =>
    new Date(date).toLocaleString(en ? "en-GB" : "uk-UA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const hasFilters = Boolean(query || selectedSite || selectedStatus);
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="dashboard-page leads-overview-page all-leads-page">
      <div className="leads-overview-top">
        <div>
          <h1 className="dashboard-page-title dashboard-semibold">
            {en ? "All leads" : "Усі ліди"}
          </h1>
          <p className="dashboard-page-description">
            {en
              ? "Leads from all of your websites in one list."
              : "Заявки з усіх ваших сайтів в одному списку."}
          </p>
        </div>
        <span className="leads-site-count">
          {total} {en ? "leads" : "заявок"}
        </span>
      </div>

      <div className="table-nav all-leads-filters">
        <div className="table-nav-left">
          <LeadSearchInput language={language} />

          <select
            className="all-leads-select"
            value={selectedSite}
            onChange={(event) => setFilter("site", event.target.value)}
            aria-label={en ? "Website" : "Сайт"}
          >
            <option value="">{en ? "All websites" : "Усі сайти"}</option>
            {websites.map((site) => (
              <option key={site.xSiteId} value={site.xSiteId}>
                {site.name}
              </option>
            ))}
          </select>

          <select
            className="all-leads-select"
            value={selectedStatus}
            onChange={(event) => setFilter("status", event.target.value)}
            aria-label={en ? "Status" : "Статус"}
          >
            <option value="">{en ? "All statuses" : "Усі статуси"}</option>
            <option value="New">{en ? "New" : "Новий"}</option>
            {statusOptions.map((status) => (
              <option key={status.name} value={status.name}>
                {status.name}
              </option>
            ))}
            {selectedStatus &&
              selectedStatus.toLowerCase() !== "new" &&
              !statusOptions.some((s) => s.name === selectedStatus) && (
                <option value={selectedStatus}>{selectedStatus}</option>
              )}
          </select>

          {hasFilters && (
            <Link href={pathname} className="table-nav-btn all-leads-reset">
              {en ? "Reset filters" : "Скинути фільтри"}
            </Link>
          )}
        </div>
      </div>

      {query && (
        <p className="lead-search-summary">
          {en ? "Found" : "Знайдено"}: <strong>{total}</strong>{" "}
          {en ? "for" : "за запитом"} «{query}»
        </p>
      )}

      <div
        className={`dashboard-surface leads-table-wrapper ${isPending ? "all-leads-pending" : ""}`}
      >
        {rows.length ? (
          <table className="leads-overview-table all-leads-table">
            <thead>
              <tr>
                <th style={{ width: 130 }}>{en ? "Status" : "Статус"}</th>
                <th style={{ width: 180 }}>{en ? "Website" : "Сайт"}</th>
                <th>{en ? "Contact" : "Контакт"}</th>
                <th>{en ? "Details" : "Деталі"}</th>
                <th style={{ width: 190 }}>{en ? "Client" : "Клієнт"}</th>
                <th style={{ width: 150 }}>{en ? "Received" : "Отримано"}</th>
                <th style={{ width: 130 }}></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const status = normalizeLeadStatus(row.status, language);
                const color = STATUS_COLORS.find(
                  (item) => item.id === status.colorId,
                );
                const { name, phone, email, other } = row.summary;
                return (
                  <tr key={row.id}>
                    <td>
                      <span
                        className={`status-badge ${status.colorId}`}
                        style={
                          color
                            ? { background: color.bg, color: color.text }
                            : undefined
                        }
                      >
                        {status.text}
                      </span>
                    </td>
                    <td>
                      {row.website ? (
                        <Link
                          href={`/dashboard/leads/${row.website.xSiteId}`}
                          className="all-leads-site"
                          title={row.website.url}
                        >
                          <RxGlobe aria-hidden="true" />
                          <span>{row.website.name}</span>
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <div className="all-leads-contact">
                        <span className="all-leads-contact-name">
                          {name || phone || email || "—"}
                        </span>
                        {(name ? [phone, email] : phone ? [email] : [])
                          .filter(Boolean)
                          .map((value) => (
                            <span key={value} className="all-leads-muted">
                              {value}
                            </span>
                          ))}
                      </div>
                    </td>
                    <td>
                      <div className="all-leads-details">
                        {other.slice(0, 3).map((field) => (
                          <span key={field.key} title={field.value}>
                            <span className="all-leads-muted">
                              {field.label}:
                            </span>{" "}
                            {field.value}
                          </span>
                        ))}
                        {other.length > 3 && (
                          <span className="all-leads-muted">
                            +{other.length - 3}
                          </span>
                        )}
                        {!other.length && <span className="all-leads-muted">—</span>}
                      </div>
                    </td>
                    <td>
                      {row.client ? (
                        <div className="all-leads-client">
                          <Link
                            href={`/dashboard/clients/${row.client.id}`}
                            className="all-leads-client-link"
                          >
                            {row.client.name}
                          </Link>
                          <ClientDiscountBadge
                            percent={row.client.discountPercent}
                            language={language}
                            compact
                          />
                        </div>
                      ) : (
                        <span className="all-leads-muted">—</span>
                      )}
                    </td>
                    <td className="leads-date">
                      <span className="lead-cell-text">
                        {formatDate(row.createdAt)}
                      </span>
                    </td>
                    <td>
                      <Link
                        href={`/dashboard/lead/${row.id}`}
                        className="dashboard-primary-button dashboard-primary-button-standard all-leads-view"
                      >
                        {en ? "View" : "Переглянути"}
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
              {hasFilters
                ? query
                  ? en
                    ? `Nothing found for «${query}».`
                    : `За запитом «${query}» нічого не знайдено.`
                  : en
                    ? "No leads match the selected filters."
                    : "Немає заявок за вибраними фільтрами."
                : en
                  ? "No leads received yet."
                  : "Ще немає отриманих заявок."}
            </p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="all-leads-pagination" aria-label={en ? "Pages" : "Сторінки"}>
          <span className="all-leads-muted">
            {from}–{to} {en ? "of" : "з"} {total}
          </span>
          <div className="all-leads-pages">
            {page > 1 ? (
              <Link
                className="table-nav-btn"
                href={hrefWith({ page: page - 1 > 1 ? String(page - 1) : null })}
                scroll={false}
                aria-label={en ? "Previous page" : "Попередня сторінка"}
              >
                <RxChevronLeft />
              </Link>
            ) : (
              <span className="table-nav-btn is-disabled" aria-hidden="true">
                <RxChevronLeft />
              </span>
            )}
            <span className="all-leads-page-label">
              {en ? "Page" : "Сторінка"} {page} {en ? "of" : "з"} {totalPages}
            </span>
            {page < totalPages ? (
              <Link
                className="table-nav-btn"
                href={hrefWith({ page: String(page + 1) })}
                scroll={false}
                aria-label={en ? "Next page" : "Наступна сторінка"}
              >
                <RxChevronRight />
              </Link>
            ) : (
              <span className="table-nav-btn is-disabled" aria-hidden="true">
                <RxChevronRight />
              </span>
            )}
          </div>
        </nav>
      )}
    </div>
  );
}
