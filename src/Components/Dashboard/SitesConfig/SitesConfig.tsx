"use client";

// type LeadField = {
//   name: string;
//   required: boolean;
// };

import { useSession } from "next-auth/react";
import { RxCross2, RxGlobe, RxPencil1, RxPlus, RxTrash } from "react-icons/rx";
import "./style.css";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Website } from "@/generated/prisma/client";
import axios from "axios";
import { toast } from "sonner";

export function SitesConfig() {
  const { data: session } = useSession();
  const language = session?.user.language;
  const [websites, setWebsites] = useState<Website[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    websiteName: "",
    url: "",
  });

  const [formLoading, setFormLoading] = useState(false);

  // const [leadFields, setLeadFields] = useState<LeadField[]>([
  //   {
  //     name: "Ім'я",
  //     required: true,
  //   },
  //   {
  //     name: "Номер телефону",
  //     required: true,
  //   },
  //   {
  //     name: "Коментар",
  //     required: false,
  //   },
  // ]);

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formLoading || loading) {
      return;
    }

    if (!formData.url || !formData.websiteName) {
      toast.error(
        language === "en"
          ? "Please fill in all fields"
          : "Будь ласка, заповніть всі поля",
      );
      return;
    }

    setFormLoading(true);

    try {
      const response = await axios.post(
        "/api/crm/sites-config/create-site",
        formData,
      );

      setWebsites((prev) => [...prev, response.data.website]);

      toast.success(
        language === "en"
          ? "Website added successfully"
          : "Сайт успішно додано",
      );

      setFormData({
        websiteName: "",
        url: "",
      });

      setIsModalOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            (language === "en"
              ? "Failed to add website"
              : "Не вдалося додати сайт"),
        );
      } else {
        toast.error(
          language === "en" ? "Something went wrong" : "Щось пішло не так",
        );
      }
    } finally {
      setFormLoading(false);
    }
  };

  const deleteSite = async (id: string) => {
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
    } catch (error) {
      console.error(error);
      toast.error(
        language === "en" ? "Something went wrong" : "Щось пішло не так",
      );
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
                      <button className="website-action">
                        <RxPencil1 />
                      </button>

                      <button
                        className="website-action website-delete"
                        onClick={() => deleteSite(website.id)}
                      >
                        <RxTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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
        <div
          className="website-modal-overlay"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="website-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="website-modal-top">
              <div>
                <h2 className="website-modal-title">
                  {language === "en" ? "Add website" : "Додати сайт"}
                </h2>

                <p className="website-modal-description">
                  {language === "en"
                    ? "Connect a website to start receiving leads."
                    : "Підключіть сайт, щоб почати отримувати заявки."}
                </p>
              </div>

              <button
                className="website-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                <RxCross2 />
              </button>
            </div>

            <form className="website-form" onSubmit={handleSubmit}>
              <div className="website-form-field">
                <label>
                  {language === "en" ? "Website name" : "Назва сайту"}
                </label>

                <input
                  type="text"
                  placeholder={language === "en" ? "My website" : "Мій сайт"}
                  value={formData.websiteName}
                  onChange={(e) =>
                    setFormData({ ...formData, websiteName: e.target.value })
                  }
                />
              </div>

              <div className="website-form-field">
                <label>URL</label>

                <input
                  type="url"
                  placeholder="https://example.com"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                />
              </div>

              {/* <div className="website-form-field">
                <div className="lead-schema-title-top">
                  <span className="lead-schema-label">
                    {language === "en"
                      ? "Data received from website"
                      : "Дані які приймаємо з сайту"}
                  </span>
                  <button
                    type="button"
                    className="lead-schema-title-button"
                    onClick={() =>
                      setLeadFields([
                        ...leadFields,
                        { name: "", required: false },
                      ])
                    }
                  >
                    <span>
                      {language === "en" ? "Add field" : "Додати поле"}
                    </span>
                    <RxPlus />
                  </button>
                </div>

                <div className="lead-schema-fields">
                  {leadFields.map((field, index) => (
                    <div className="lead-schema-field-row" key={index}>
                      <input
                        type="text"
                        placeholder={
                          language === "en" ? "Field name" : "Назва поля"
                        }
                        value={field.name}
                        onChange={(e) => {
                          const updated = [...leadFields];
                          updated[index] = {
                            ...updated[index],
                            name: e.target.value,
                          };
                          setLeadFields(updated);
                        }}
                      />
                      <label className="lead-schema-required-label">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const updated = [...leadFields];
                            updated[index] = {
                              ...updated[index],
                              required: e.target.checked,
                            };
                            setLeadFields(updated);
                          }}
                        />
                        {language === "en" ? "Required" : "Обов'язкове"}
                      </label>
                      <button
                        type="button"
                        className="lead-schema-field-remove"
                        onClick={() =>
                          setLeadFields(
                            leadFields.filter((_, i) => i !== index),
                          )
                        }
                      >
                        <RxCross2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div> */}

              <button
                type="submit"
                className="websites-add-button website-form-submit"
                disabled={formLoading}
              >
                <RxPlus />
                <span>
                  {formLoading
                    ? language === "en"
                      ? "Adding..."
                      : "Додавання..."
                    : language === "en"
                      ? "Add website"
                      : "Додати сайт"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
