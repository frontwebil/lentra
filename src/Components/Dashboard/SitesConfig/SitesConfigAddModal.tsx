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

export function SitesConfigAddModal({
  setIsModalOpen,
  language,
  loading,
  setWebsites,
}: {
  setIsModalOpen: Dispatch<SetStateAction<boolean>>;
  language: "uk" | "en" | undefined;
  loading: boolean;
  setWebsites: Dispatch<SetStateAction<Website[]>>;
}) {
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    websiteName: "",
    url: "",
  });
  const [leadFields, setLeadFields] = useState<LeadField[]>([
    {
      label: language == "en" ? "Name" : "Ім'я",
      key: "name",
      type: "text",
      required: true,
    },
    {
      label: language == "en" ? "Phone Number" : "Номер телефону",
      key: "phone",
      type: "text",
      required: true,
    },
    {
      label: language == "en" ? "Comment" : "Коментар",
      key: "comment",
      type: "text",
      required: false,
    },
  ]);

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
      const response = await axios.post("/api/crm/sites-config/create-site", {
        ...formData,
        leadFields,
      });

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

  return (
    <div
      className="website-modal-overlay"
      onClick={() => setIsModalOpen(false)}
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
            <label>{language === "en" ? "Website name" : "Назва сайту"}</label>

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
              type="text"
              placeholder="https://example.com"
              value={formData.url}
              onChange={(e) =>
                setFormData({ ...formData, url: e.target.value })
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
                          type: e.target.value as typeof field.type,
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
  );
}
