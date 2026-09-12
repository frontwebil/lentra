"use client";

import { useSession } from "next-auth/react";
import { RxGlobe, RxLink2, RxPencil1, RxPlus, RxTrash } from "react-icons/rx";
import "./style.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Website } from "@/generated/prisma/client";
import axios from "axios";
import { toast } from "sonner";
import { SitesConfigAddModal } from "./SitesConfigAddModal";
import { DeleteSiteModal } from "./DeleteSiteModal";
import { SitesConfigEditModal } from "./SitesConfigEditModal";

export function SitesConfig() {
  const { data: session } = useSession();
  const language = session?.user.language;
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [siteToDelete, setSiteToDelete] = useState<Website | null>(null);
  const [isModalEditOpen, setIsModalEditOpen] = useState(false);
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);

  useEffect(() => {
    const getWebsites = async () => {
      try {
        const response = await axios.get("/api/crm/sites-config");
        setWebsites(response.data.websites);
        setLoading(false);
      } catch (error) {
        toast.error(
          language == "en"
            ? "Failed to fetch websites"
            : "Помилка при отриманні сайтів",
        );
        console.error("Failed to fetch websites:", error);
      }
    };

    getWebsites();
  }, [language]);

  const deleteSite = async (id: string) => {
    if (loading) {
      return;
    }

    setLoading(true);

    try {
      await axios.delete("/api/crm/sites-config/create-site", {
        data: { id },
      });

      toast.success(
        language === "en"
          ? "Website deleted successfully"
          : "Сайт успішно видалено",
      );

      setWebsites((prev) => prev.filter((website) => website.id !== id));
      setIsDeleteModalOpen(false);
      setSiteToDelete(null);
    } catch (error) {
      console.error(error);

      toast.error(
        language === "en" ? "Something went wrong" : "Щось пішло не так",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="websites-page">
      {loading && (
        <div className="widget-loader">
          <div className="loader" style={{ borderTopColor: "#000" }} />
        </div>
      )}
      <div className="websites-page-top">
        <div>
          <h1 className="websites-page-title">
            {language === "en" ? "Websites" : "Сайти"}
          </h1>

          <p className="websites-page-description">
            {language === "en"
              ? "Manage your connected websites."
              : "Керуйте підключеними сайтами."}
          </p>
        </div>

        <button
          className="websites-add-button"
          onClick={() => setIsModalOpen(true)}
        >
          <RxPlus />

          <span>{language === "en" ? "Add website" : "Додати сайт"}</span>
        </button>
      </div>

      <div className="websites-table-wrapper">
        {websites.length > 0 ? (
          <table className="websites-table">
            <thead>
              <tr>
                <th>{language === "en" ? "Website" : "Сайт"}</th>

                <th>{language === "en" ? "URL" : "URL"}</th>

                <th>{language === "en" ? "x-site-id" : "x-site-id"}</th>

                <th>{language === "en" ? "Leads" : "Заявки"}</th>

                <th>{language === "en" ? "Created" : "Дата створення"}</th>

                <th></th>
              </tr>
            </thead>

            <tbody>
              {websites.map((website) => (
                <tr key={website.id}>
                  <td>
                    <div className="website-name">
                      <div className="website-icon">
                        <RxGlobe />
                      </div>

                      <span>{website.websiteName}</span>
                    </div>
                  </td>

                  <td>
                    <Link href={website.websiteUrl} target="_blank">
                      <span className="website-url">{website.websiteUrl}</span>
                    </Link>
                  </td>
                  <td>
                    <span className="website-x-site-id">{website.xSiteId}</span>
                  </td>

                  <td>
                    <span className="website-leads">0</span>
                  </td>

                  <td>
                    <span className="website-date">
                      {new Date(website.createdAt).toLocaleString(
                        language === "en" ? "en-US" : "uk-UA",
                        {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </td>

                  <td>
                    <div className="website-actions">
                      <button
                        className="website-action"
                        onClick={() => {
                          setSelectedWebsite(website);
                          setIsModalEditOpen(true);
                        }}
                      >
                        <RxPencil1 />
                      </button>

                      <button
                        className="website-action website-delete"
                        onClick={() => {
                          setSiteToDelete(website);
                          setIsDeleteModalOpen(true);
                        }}
                        disabled={loading}
                      >
                        <RxTrash />
                      </button>
                      <Link
                        href={`/settings/${website.id}`}
                        className="website-actions-connect"
                      >
                        <span>
                          {language === "en"
                            ? "Connect Leads"
                            : "Підключити заявки"}
                        </span>
                        <button className="website-action">
                          <RxLink2 />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {isDeleteModalOpen && siteToDelete && (
                <DeleteSiteModal
                  setIsModalOpen={setIsDeleteModalOpen}
                  onConfirm={() => deleteSite(siteToDelete.id)}
                  websiteName={siteToDelete.websiteName}
                  language={language}
                  loading={loading}
                />
              )}

              {isModalEditOpen && selectedWebsite && (
                <SitesConfigEditModal
                  setIsModalEditOpen={setIsModalEditOpen}
                  language={language}
                  loading={loading}
                  setWebsites={setWebsites}
                  website={selectedWebsite}
                />
              )}
            </tbody>
          </table>
        ) : (
          <>
            <div className="websites-empty">
              <div className="websites-empty-icon">
                <RxGlobe />
              </div>

              <h2>
                {language === "en"
                  ? "No websites yet"
                  : "У вас ще немає сайтів"}
              </h2>

              <p>
                {language === "en"
                  ? "Add your first website to start receiving and managing leads."
                  : "Додайте свій перший сайт, щоб почати отримувати та керувати заявками."}
              </p>

              <button
                className="websites-add-button websites-empty-button"
                onClick={() => setIsModalOpen(true)}
              >
                <RxPlus />

                <span>
                  {language === "en" ? "Add website" : "Додайте сайт"}
                </span>
              </button>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <SitesConfigAddModal
          setIsModalOpen={setIsModalOpen}
          language={language}
          loading={loading}
          setWebsites={setWebsites}
        />
      )}
    </div>
  );
}
