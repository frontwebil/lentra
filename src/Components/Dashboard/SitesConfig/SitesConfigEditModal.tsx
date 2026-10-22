"use client";

import { Website } from "@/generated/prisma/client";
import axios from "axios";
import { Dispatch, SetStateAction, useState } from "react";
import { RxChevronDown, RxChevronUp, RxCross2, RxPlus } from "react-icons/rx";
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

  // Перевірка, чи тип уже використовується в іншому полі
  const isTypeSelected = (type: string, currentIndex: number) => {
    return leadFields.some(
      (field, idx) => idx !== currentIndex && field.type === type,
    );
  };

  // Переміщення поля вгору або вниз
  const moveField = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= leadFields.length) return;

    const updated = [...leadFields];
    const [movedItem] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, movedItem);
    setLeadFields(updated);
  };

  // Зміна типу поля з автоматичною підстановкою label та key для Date/Time
  const handleTypeChange = (index: number, newType: string) => {
    const updated = [...leadFields];
    const currentField = updated[index];

    let newLabel = currentField.label;
    let newKey = currentField.key;

    if (newType === "date") {
      newLabel = language === "en" ? "Booking date" : "Дата запису";
      if (!newKey || newKey === "key") newKey = "booking_date";
    } else if (newType === "time") {
      newLabel = language === "en" ? "Booking time" : "Час запису";
      if (!newKey || newKey === "key") newKey = "booking_time";
    }

    updated[index] = {
      ...currentField,
      type: newType,
      label: newLabel,
      key: newKey,
    };

    setLeadFields(updated);
  };

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
          item.id === website.id ? { ...item, ...response.data.website } : item,
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
      className="dashboard-modal-overlay website-modal-overlay"
      onClick={() => setIsModalEditOpen(false)}
    >
      <div
        className="dashboard-surface website-modal"
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
            <h2 className="dashboard-semibold website-modal-title">
              {language === "en" ? "Edit website" : "Редагувати сайт"}
            </h2>

            <p className="website-modal-description">
              {language === "en"
                ? "Update your website settings."
                : "Оновіть налаштування вашого сайту."}
            </p>
          </div>

          <button
            className="dashboard-icon-button website-modal-close"
            type="button"
            onClick={() => setIsModalEditOpen(false)}
          >
            <RxCross2 />
          </button>
        </div>

        <form className="website-form" onSubmit={handleSubmit}>
          <div className="website-form-field">
            <label className="dashboard-form-label">
              {language === "en" ? "Website name" : "Назва сайту"}
            </label>

            <input
              type="text"
              className="dashboard-input"
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
            <label className="dashboard-form-label">URL</label>

            <input
              type="text"
              className="dashboard-input"
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
            <div className="dashboard-form-label lead-schema-title-top">
              <span className="lead-schema-label">
                {language === "en"
                  ? "Data received from website"
                  : "Дані які приймаємо з сайту"}
              </span>

              <button
                type="button"
                className="dashboard-primary-button dashboard-primary-button-schema lead-schema-title-button"
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
                <div
                  className="lead-schema-field-row"
                  key={index}
                  style={{
                    position: "relative",
                    paddingLeft: "28px",
                  }}
                >
                  {/* Колонка зі стрілочками ліворуч */}
                  <div
                    className="lead-schema-field-reorder"
                    style={{
                      position: "absolute",
                      left: "4px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2px",
                    }}
                  >
                    <button
                      type="button"
                      className="dashboard-icon-button"
                      disabled={index === 0}
                      onClick={() => moveField(index, "up")}
                      title={
                        language === "en" ? "Move up" : "Перемістити вгору"
                      }
                    >
                      <RxChevronUp />
                    </button>
                    <button
                      type="button"
                      className="dashboard-icon-button"
                      disabled={index === leadFields.length - 1}
                      onClick={() => moveField(index, "down")}
                      title={
                        language === "en" ? "Move down" : "Перемістити вниз"
                      }
                    >
                      <RxChevronDown />
                    </button>
                  </div>

                  <div className="lead-schema-field-input">
                    <span className="lead-schema-field-label">
                      {language === "en" ? "Field name" : "Назва поля"}
                    </span>

                    <input
                      type="text"
                      className="dashboard-input"
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
                      className="dashboard-input"
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
                      className="dashboard-input"
                      value={field.type}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                    >
                      <option value="text">
                        {language === "en" ? "Text" : "Текст"}
                      </option>

                      <option
                        value="date"
                        disabled={isTypeSelected("date", index)}
                      >
                        {language === "en" ? "Booking date" : "Дата запису"}
                      </option>

                      <option
                        value="time"
                        disabled={isTypeSelected("time", index)}
                      >
                        {language === "en" ? "Booking time" : "Час запису"}
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
                    className="dashboard-icon-button lead-schema-field-remove"
                    disabled={leadFields.length <= 1}
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
            className="dashboard-primary-button dashboard-primary-button-standard websites-add-button website-form-submit"
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
