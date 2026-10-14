"use client";

import { Lead, Website } from "@/generated/prisma/client";
import axios from "axios";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { RxEyeOpen, RxGlobe, RxPencil1 } from "react-icons/rx";
import { toast } from "sonner";
import { SitesConfigEditModal } from "../SitesConfig/SitesConfigEditModal";
import "../SitesConfig/style.css";
import "./style.css";

type WebsiteRow = Website & {
  _count?: {
    leads: number;
  };
  latestLeadAt?: string | Date | null;
  totalLeads: number;
  newLeads: number;
};

type LeadField = {
  key: string;
  label: string;
  type: string;
  required: boolean;
};

type WebsiteType = Website & {
  leads: Lead[];
};

export function Leeds() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);

  const { data: session } = useSession();
  const language = session?.user.language;

  useEffect(() => {
    const getWebsites = async () => {
      try {
        const response = await axios.get("/api/crm/sites-config");
        setWebsites(response.data.websites);
      } catch (error) {
        toast.error(
          language == "en"
            ? "Failed to fetch websites"
            : "Помилка при отриманні сайтів",
        );
        console.error("Failed to fetch websites:", error);
      } finally {
        setLoading(false);
      }
    };

    getWebsites();
  }, [language]);

  return (
    <div className="dashboard-page leads-overview-page">
      {loading || !language ? (
        <div className="widget-loader">
          <div className="loader" style={{ borderTopColor: "#000" }} />
        </div>
      ) : (
        <>
          <div className="leads-overview-top">
            <div>
              <h1 className="dashboard-page-title dashboard-semibold">
                {language === "en" ? "Leads" : "Заявки"}
              </h1>
              <p className="dashboard-page-description">
                {language === "en"
                  ? "Review lead activity across your websites."
                  : "Переглядайте заявки з усіх підключених сайтів."}
              </p>
            </div>
            <span className="leads-site-count">
              {websites.length} {language === "en" ? "websites" : "сайтів"}
            </span>
          </div>

          <div className="dashboard-surface leads-table-wrapper">
            {websites.length ? (
              <table className="leads-overview-table">
                <thead>
                  <tr>
                    <th>{language === "en" ? "Website" : "Назва сайту"}</th>
                    <th>{language === "en" ? "Lead fields" : "Поля заявки"}</th>
                    <th>
                      {language === "en" ? "Last lead" : "Остання заявка"}
                    </th>
                    <th>{language === "en" ? "Leads" : "Заявки"}</th>
                    <th>{language === "en" ? "New leads" : "Нові заявки"}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {websites.map((website) => {
                    const row = website as WebsiteRow;
                    const fields = Array.isArray(website.leadSchema)
                      ? (website.leadSchema as LeadField[])
                      : [];

                    return (
                      <tr key={website.id}>
                        <td>
                          <div className="leads-website-name">
                            <div className="dashboard-icon-tile leads-website-icon">
                              <RxGlobe />
                            </div>
                            <div className="leads-website-copy">
                              <span>{website.websiteName}</span>
                              <span>{website.websiteUrl}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="leads-field-list">
                            {fields.length ? (
                              <>
                                {fields.slice(0, 3).map((field) => (
                                  <span
                                    className="leads-field-chip"
                                    key={field.key}
                                  >
                                    {field.label || field.key}
                                  </span>
                                ))}
                                {fields.length > 3 && (
                                  <span className="leads-field-chip leads-field-more">
                                    +{fields.length - 3}
                                  </span>
                                )}
                              </>
                            ) : (
                              <span className="leads-muted">
                                {language === "en"
                                  ? "No fields"
                                  : "Немає полів"}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="leads-last-date">
                          {row.latestLeadAt
                            ? new Date(row.latestLeadAt).toLocaleString(
                                language === "en" ? "en-US" : "uk-UA",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )
                            : language === "en"
                              ? "No leads yet"
                              : "Ще немає заявок"}
                        </td>
                        <td>
                          <span className="leads-total-count">
                            {row._count?.leads ?? 0}
                          </span>
                        </td>
                        <td>
                          <span className="leads-total-count leads-new-count">
                            {row.newLeads ?? 0}
                          </span>
                        </td>
                        <td>
                          <div className="leads-row-actions">
                            <button
                              type="button"
                              className="dashboard-icon-button leads-edit-button"
                              title={
                                language === "en"
                                  ? "Edit website"
                                  : "Редагувати сайт"
                              }
                              aria-label={
                                language === "en"
                                  ? "Edit website"
                                  : "Редагувати сайт"
                              }
                              onClick={() => setSelectedWebsite(website)}
                            >
                              <RxPencil1 />
                            </button>
                            <Link
                              href={`/dashboard/leads/${website.xSiteId}`}
                              className="dashboard-primary-button dashboard-primary-button-standard leads-view-button"
                            >
                              <RxEyeOpen />
                              <span>
                                {language === "en"
                                  ? "View leads"
                                  : "Переглянути заявки"}
                              </span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="dashboard-empty-state leads-empty-state">
                <div className="dashboard-icon-tile dashboard-empty-icon">
                  <RxGlobe />
                </div>
                <h2 className="dashboard-empty-title dashboard-semibold">
                  {language === "en" ? "No websites yet" : "Ще немає сайтів"}
                </h2>
                <p className="dashboard-empty-description">
                  {language === "en"
                    ? "Connected websites and their leads will appear here."
                    : "Підключені сайти та їхні заявки з’являться тут."}
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {selectedWebsite && language && (
        <SitesConfigEditModal
          setIsModalEditOpen={(isOpen) => {
            if (!isOpen) setSelectedWebsite(null);
          }}
          language={language}
          loading={loading}
          setWebsites={setWebsites}
          website={selectedWebsite}
        />
      )}
    </div>
  );
}
