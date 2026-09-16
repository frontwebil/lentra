"use client";

import { useEffect, useMemo, useState } from "react";

import axios from "axios";

import { RxCheck, RxClipboard, RxCopy, RxGlobe, RxPlus } from "react-icons/rx";

import "./style.css";

import { useSession } from "next-auth/react";

import { toast } from "sonner";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type LeadField = {
  key: string;
  type: "text" | "date";
  label: string;
  required: boolean;
};

type Website = {
  id: string;
  websiteName: string;
  websiteUrl: string;
  xSiteId: string;
  leadSchema: LeadField[];
};

export function ConnectLeads() {
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const searchParams = useSearchParams();
  const xSiteId = searchParams.get("x-site-id");
  const { data: session } = useSession();

  const language = session?.user.language;

  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const getWebsites = async () => {
      try {
        const response = await axios.get("/api/crm/sites-config");

        const data = Array.isArray(response.data?.websites)
          ? response.data.websites
          : [];

        setWebsites(data);

        if (data.length > 0) {
          const requestedWebsite = xSiteId
            ? data.find((website: Website) => website.xSiteId === xSiteId)
            : null;

          setSelectedWebsite(requestedWebsite ?? data[0]);
        } else {
          setSelectedWebsite(null);
        }
      } catch (error) {
        toast.error(
          language === "en"
            ? "Failed to fetch websites"
            : "Помилка при отриманні сайтів",
        );

        console.error("Failed to fetch websites:", error);
        setWebsites([]);
        setSelectedWebsite(null);
      } finally {
        setLoading(false);
      }
    };

    getWebsites();
  }, [language, xSiteId]);

  const leadSchema = Array.isArray(selectedWebsite?.leadSchema)
    ? selectedWebsite.leadSchema
    : [];

  const exampleData = useMemo(() => {
    if (!selectedWebsite) {
      return {};
    }

    const data: Record<string, string> = {};

    const schema = Array.isArray(selectedWebsite.leadSchema)
      ? selectedWebsite.leadSchema
      : [];

    schema.forEach((field) => {
      if (field.type === "date") {
        data[field.key] = new Date().toISOString().split("T")[0];
      } else {
        data[field.key] = `Example ${field.label}`;
      }
    });

    return data;
  }, [selectedWebsite]);

  const fetchCode = useMemo(() => {
    if (!selectedWebsite) {
      return "";
    }

    return `fetch("https://www.lentra.tech/api/leed", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-site-id": "${selectedWebsite.xSiteId}",
  },
  body: JSON.stringify(${JSON.stringify(exampleData, null, 2)}),
});`;
  }, [selectedWebsite, exampleData]);

  const jsonCode = JSON.stringify(exampleData, null, 2);

  const copyToClipboard = async (value: string, type: string) => {
    try {
      await navigator.clipboard.writeText(value);

      setCopied(type);

      setTimeout(() => {
        setCopied(null);
      }, 1500);
    } catch {
      setCopied(null);
    }
  };

  if (!loading && websites.length <= 0) {
    return (
      <div className="websites-empty">
        <div className="websites-empty-icon">
          <RxGlobe />
        </div>

        <h2>
          {language === "en" ? "No websites yet" : "У вас ще немає сайтів"}
        </h2>

        <p>
          {language === "en"
            ? "Add your first website to start receiving and managing leads."
            : "Додайте свій перший сайт, щоб почати отримувати та керувати заявками."}
        </p>

        <Link
          href="/dashboard/sites-config"
          className="websites-add-button websites-empty-button"
        >
          <RxPlus />

          <span>{language === "en" ? "Add website" : "Додайте сайт"}</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="connect-leads">
      {loading || !language ? (
        <div className="widget-loader">
          <div className="loader" style={{ borderTopColor: "#000" }} />
        </div>
      ) : (
        <>
          <div className="connect-leads-header">
            <h1>
              {language === "en" ? "Connect leads" : "Підключення заявок"}
            </h1>

            <p>
              {language === "en"
                ? "Connect your websites to Lentra and send leads directly to your CRM."
                : "Підключіть свої сайти до Lentra та надсилайте заявки прямо у вашу CRM."}
            </p>
          </div>

          <div className="connect-leads-layout">
            <aside className="connect-leads-sidebar">
              <div className="connect-leads-sidebar-title">
                {language === "en" ? "Websites" : "Сайти"}
              </div>

              <div className="connect-leads-websites">
                {websites.map((website) => (
                  <button
                    key={website.id}
                    type="button"
                    className={
                      selectedWebsite?.id === website.id
                        ? "connect-leads-website active"
                        : "connect-leads-website"
                    }
                    onClick={() => setSelectedWebsite(website)}
                  >
                    <span className="connect-leads-website-icon">
                      <RxGlobe />
                    </span>

                    <span className="connect-leads-website-info">
                      <span className="connect-leads-website-name">
                        {website.websiteName}
                      </span>

                      <span className="connect-leads-website-url">
                        {website.websiteUrl}
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </aside>

            {selectedWebsite && (
              <main className="connect-leads-content">
                <div className="connect-leads-site-header">
                  <div>
                    <div className="connect-leads-site-title-row">
                      <div className="connect-leads-site-icon">
                        <RxGlobe />
                      </div>

                      <div>
                        <h2>{selectedWebsite.websiteName}</h2>

                        <p>{selectedWebsite.websiteUrl}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <section className="connect-leads-section">
                  <div className="connect-leads-section-top">
                    <div>
                      <h3>Site ID</h3>

                      <p>
                        {language === "en"
                          ? "Use this ID when sending leads to Lentra."
                          : "Використовуйте цей ID для надсилання заявок у Lentra."}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="connect-leads-copy-button"
                      onClick={() =>
                        copyToClipboard(selectedWebsite.xSiteId, "site-id")
                      }
                    >
                      {copied === "site-id" ? <RxCheck /> : <RxCopy />}

                      {copied === "site-id"
                        ? language === "en"
                          ? "Copied"
                          : "Скопійовано"
                        : language === "en"
                          ? "Copy"
                          : "Копіювати"}
                    </button>
                  </div>

                  <div className="connect-leads-site-id">
                    {selectedWebsite.xSiteId}
                  </div>
                </section>

                <section className="connect-leads-section">
                  <div className="connect-leads-section-top">
                    <div>
                      <h3>
                        {language === "en" ? "Send leads" : "Надсилання заявок"}
                      </h3>

                      <p>
                        {language === "en"
                          ? "Add this request to your website to send leads to Lentra."
                          : "Додайте цей запит на свій сайт, щоб надсилати заявки в Lentra."}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="connect-leads-copy-button"
                      onClick={() => copyToClipboard(fetchCode, "fetch")}
                    >
                      {copied === "fetch" ? <RxCheck /> : <RxClipboard />}

                      {copied === "fetch"
                        ? language === "en"
                          ? "Copied"
                          : "Скопійовано"
                        : language === "en"
                          ? "Copy code"
                          : "Копіювати код"}
                    </button>
                  </div>

                  <pre className="connect-leads-code">
                    <code>{fetchCode}</code>
                  </pre>
                </section>

                <section className="connect-leads-section">
                  <div className="connect-leads-section-top">
                    <div>
                      <h3>
                        {language === "en" ? "Lead fields" : "Поля заявки"}
                      </h3>

                      <p>
                        {language === "en"
                          ? "These fields are configured for this website."
                          : "Ці поля налаштовані для цього сайту."}
                      </p>
                    </div>
                  </div>

                  <div className="connect-leads-fields">
                    {leadSchema.length === 0 ? (
                      <div className="connect-leads-no-fields">
                        {language === "en"
                          ? "No lead fields configured."
                          : "Поля заявки не налаштовані."}
                      </div>
                    ) : (
                      leadSchema.map((field) => (
                        <div className="connect-leads-field" key={field.key}>
                          <div className="connect-leads-field-info">
                            <span className="connect-leads-field-label">
                              {field.label}
                            </span>

                            <span className="connect-leads-field-key">
                              {field.key}
                            </span>
                          </div>

                          <span className="connect-leads-field-type">
                            {field.type === "date" ? "date" : field.type}
                          </span>

                          <span
                            className={
                              field.required
                                ? "connect-leads-required"
                                : "connect-leads-optional"
                            }
                          >
                            {field.required
                              ? language === "en"
                                ? "Required"
                                : "Обов'язкове"
                              : language === "en"
                                ? "Optional"
                                : "Необов'язкове"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </section>

                <section className="connect-leads-section">
                  <div className="connect-leads-section-top">
                    <div>
                      <h3>
                        {language === "en" ? "Request body" : "Тіло запиту"}
                      </h3>

                      <p>
                        {language === "en"
                          ? "Example JSON that can be sent to the API."
                          : "Приклад JSON, який можна надіслати до API."}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="connect-leads-copy-button"
                      onClick={() => copyToClipboard(jsonCode, "json")}
                    >
                      {copied === "json" ? <RxCheck /> : <RxClipboard />}

                      {copied === "json"
                        ? language === "en"
                          ? "Copied"
                          : "Скопійовано"
                        : language === "en"
                          ? "Copy JSON"
                          : "Копіювати JSON"}
                    </button>
                  </div>

                  <pre className="connect-leads-code">
                    <code>{jsonCode}</code>
                  </pre>
                </section>

                <section className="connect-leads-section">
                  <div className="connect-leads-domain">
                    <div>
                      <h3>
                        {language === "en"
                          ? "Allowed domain"
                          : "Дозволений домен"}
                      </h3>

                      <p>
                        {language === "en"
                          ? "Requests must come from the connected website domain."
                          : "Запити повинні надходити з домену підключеного сайту."}
                      </p>
                    </div>

                    <span>{selectedWebsite.websiteUrl}</span>
                  </div>
                </section>
              </main>
            )}
          </div>
        </>
      )}
    </div>
  );
}
