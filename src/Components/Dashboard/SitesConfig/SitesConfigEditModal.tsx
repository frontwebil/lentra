"use client";

import { Website } from "@/generated/prisma/client";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { RxCross2, RxPlus } from "react-icons/rx";
import { toast } from "sonner";

type LeadField = {
  label: string;
  key: string;
  required: boolean;
  type: string;
};

export function SitesConfigEditModal({
  setIsModalEditOpen,
  language,
  loading,
  setWebsites,
  website,
}: {
  setIsModalEditOpen: Dispatch<SetStateAction<boolean>>;
  language: "uk" | "en" | undefined;
  loading: boolean;
  setWebsites: Dispatch<SetStateAction<Website[]>>;
  website: Website;
}) {
  const [formLoading, setFormLoading] = useState(false);

  const [formData, setFormData] = useState({
    websiteName: website.websiteName,
    url: website.websiteUrl,
  });

  const [leadFields, setLeadFields] = useState<LeadField[]>(
    website.leadSchema as LeadField[],
  );

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
      const response = await axios.put("/api/crm/sites-config/create-site", {
        id: website.id,
        websiteName: formData.websiteName,
        url: formData.url,
        leadFields,
      });

      setWebsites((prev) =>
        prev.map((item) =>
          item.id === website.id ? response.data.website : item,
        ),
      );

      toast.success(
        language === "en"
          ? "Website updated successfully"
          : "Сайт успішно оновлено",
      );

      setIsModalEditOpen(false);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(
          error.response?.data?.message ||
            (language === "en"
              ? "Failed to update website"
              : "Не вдалося оновити сайт"),
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

  return (
    <div
      className="website-modal-overlay"
      onClick={() => setIsModalEditOpen(false)}
    >
      <div
        className="website-modal"
        style={{ position: "relative" }}
        onClick={(event) => event.stopPropagation()}
      >
        {formLoading && (
          <div className="widget-loader">
            <div className="loader" style={{ borderTopColor: "#000" }} />
          </div>
        )}

        <div className="website-modal-top">
          <div>
            <h2 className="website-modal-title">
              {language === "en" ? "Edit website" : "Редагувати сайт"}
            </h2>

            <p className="website-modal-description">
              {language === "en"
                ? "Update your website settings."
                : "Оновіть налаштування вашого сайту."}
            </p>
          </div>

          <button
            className="website-modal-close"
            type="button"
            onClick={() => setIsModalEditOpen(false)}
          >
            <RxCross2 />
          </button>
        </div>

        <form className="website-form" onSubmit={handleSubmit}>
          <div className="website-form-field">
            <label>{language === "en" ? "Website name" : "Назва сайту"}</label>

            <input
              type="text"
              placeholder={language === "en" ? "My website" : "Мій сайт"}
              value={formData.websiteName}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  websiteName: e.target.value,
                })
              }
            />
          </div>

          <div className="website-form-field">
            <label>URL</label>

            <input
              type="text"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  url: e.target.value,
                })
              }
            />
          </div>

          <div className="website-form-field">
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
                    {
                      label: "",
                      key: "key",
                      type: "text",
                      required: false,
                    },
                  ])
                }
              >
                <span>{language === "en" ? "Add field" : "Додати поле"}</span>
                <RxPlus />
              </button>
            </div>

            <div className="lead-schema-fields">
              {leadFields.map((field, index) => (
                <div className="lead-schema-field-row" key={index}>
                  <div className="lead-schema-field-input">
                    <span className="lead-schema-field-label">
                      {language === "en" ? "Field name" : "Назва поля"}
                    </span>

                    <input
                      type="text"
                      placeholder={
                        language === "en"
                          ? "e.g. Phone number"
                          : "Наприклад, Номер телефону"
                      }
                      value={field.label}
                      onChange={(e) => {
                        const updated = [...leadFields];

                        updated[index] = {
                          ...updated[index],
                          label: e.target.value,
                        };

                        setLeadFields(updated);
                      }}
                    />
                  </div>

                  <div className="lead-schema-field-input">
                    <span className="lead-schema-field-label">
                      {language === "en" ? "Field key" : "Ключ поля"}
                    </span>

                    <input
                      type="text"
                      placeholder={
                        language === "en" ? "e.g. phone" : "Наприклад, phone"
                      }
                      value={field.key}
                      onChange={(e) => {
                        const updated = [...leadFields];

                        updated[index] = {
                          ...updated[index],
                          key: e.target.value,
                        };

                        setLeadFields(updated);
                      }}
                    />
                  </div>

                  <div className="lead-schema-field-input lead-schema-field-type">
                    <span className="lead-schema-field-label">
                      {language === "en" ? "Data type" : "Тип даних"}
                    </span>

                    <select
                      value={field.type}
                      onChange={(e) => {
                        const updated = [...leadFields];

                        updated[index] = {
                          ...updated[index],
                          type: e.target.value,
                        };

                        setLeadFields(updated);
                      }}
                    >
                      <option value="text">
                        {language === "en" ? "Text" : "Текст"}
                      </option>

                      <option value="date">
                        {language === "en" ? "Date" : "Дата"}
                      </option>
                    </select>
                  </div>

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
                      setLeadFields(leadFields.filter((_, i) => i !== index))
                    }
                  >
                    <RxCross2 />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="websites-add-button website-form-submit"
            disabled={formLoading}
          >
            <RxPlus />

            <span>
              {formLoading
                ? language === "en"
                  ? "Saving..."
                  : "Збереження..."
                : language === "en"
                  ? "Save changes"
                  : "Зберегти зміни"}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
