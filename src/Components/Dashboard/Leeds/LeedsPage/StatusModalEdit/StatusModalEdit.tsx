import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { RxCross2, RxPlus, RxTrash } from "react-icons/rx";
import "./style.css";
import { STATUS_COLORS } from "@/dictionaries/status-colors";
import axios from "axios";
import { Website } from "@/generated/prisma/client";
import { toast } from "sonner";

type StatusItem = {
  id: string;
  name: string;
  colorId: string;
};

export function StatusModalEdit({
  language,
  websiteStatuses,
  setIsStatusModalOpen,
  website,
  setCurrentStatuses,
}: {
  setIsStatusModalOpen: Dispatch<SetStateAction<boolean>>;
  language: "uk" | "en" | undefined;
  websiteStatuses: StatusItem[];
  website: Website;
  setCurrentStatuses: (newStatuses: StatusItem[]) => void;
}) {
  const [formLoading, setFormLoading] = useState(false);

  const [statuses, setStatuses] = useState<StatusItem[]>([
    ...(websiteStatuses ?? []),
  ]);

  const handleAddStatus = () => {
    setStatuses([
      ...statuses,
      { id: Date.now().toString(), name: "", colorId: "gray" },
    ]);
  };

  const handleUpdateStatus = (
    id: string,
    field: keyof StatusItem,
    value: string,
  ) => {
    setStatuses(
      statuses.map((status) =>
        status.id === id ? { ...status, [field]: value } : status,
      ),
    );
  };

  useEffect(() => {
    setStatuses(websiteStatuses ?? []);
  }, [websiteStatuses]);

  const handleRemoveStatus = (id: string) => {
    setStatuses(statuses.filter((status) => status.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formLoading) return;

    setFormLoading(true);

    try {
      await axios.post("/api/crm/set-statuses", {
        statuses,
        websiteId: website.id,
      });

      setCurrentStatuses(statuses);

      toast.success(
        language === "en"
          ? "Statuses saved successfully"
          : "Статуси успішно збережено",
      );

      setIsStatusModalOpen(false);
    } catch (error) {
      console.error("Failed to save statuses:", error);

      toast.error(
        language === "en"
          ? "Failed to save statuses"
          : "Не вдалося зберегти статуси",
      );
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="dashboard-modal-overlay website-modal-overlay">
      <div
        className="dashboard-surface website-modal-status"
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
              {language === "en"
                ? "Manage lead statuses"
                : "Налаштування статусів лідів"}
            </h2>
            <p className="website-modal-description">
              {language === "en"
                ? "Add, edit, or remove statuses for your leads."
                : "Додавайте, редагуйте або видаляйте статуси для ваших лідів."}
            </p>
          </div>

          <button
            className="dashboard-icon-button website-modal-close"
            type="button"
            onClick={() => setIsStatusModalOpen(false)}
          >
            <RxCross2 />
          </button>
        </div>

        <form className="website-form" onSubmit={handleSubmit}>
          <div className="status-items-container">
            {/* Перевірка на порожній список */}
            {statuses.length === 0 ? (
              <div className="empty-status-state">
                <p>
                  {language === "en"
                    ? "No statuses yet. Add your first status below."
                    : "Наразі немає жодного статусу. Додайте свій перший."}
                </p>
              </div>
            ) : (
              statuses.map((status) => {
                const selectedColor =
                  STATUS_COLORS.find((c) => c.id === status.colorId) ||
                  STATUS_COLORS[0];

                return (
                  <div key={status.id} className="status-edit-row">
                    <input
                      type="text"
                      className="status-name-input"
                      placeholder={
                        language === "en" ? "Status name" : "Назва статусу"
                      }
                      value={status.name}
                      onChange={(e) =>
                        handleUpdateStatus(status.id, "name", e.target.value)
                      }
                      required
                    />

                    <div
                      className="status-badge-preview"
                      style={{
                        backgroundColor: selectedColor.bg,
                        color: selectedColor.text,
                      }}
                    >
                      {status.name ||
                        (language === "en" ? "Empty" : "Порожньо")}
                    </div>

                    <div className="status-color-picker">
                      {STATUS_COLORS.map((color) => (
                        <button
                          key={color.id}
                          type="button"
                          className={`color-swatch ${
                            status.colorId === color.id ? "active" : ""
                          }`}
                          style={{ backgroundColor: color.bg }}
                          onClick={() =>
                            handleUpdateStatus(status.id, "colorId", color.id)
                          }
                          title={color.id}
                        />
                      ))}
                    </div>

                    <button
                      type="button"
                      className="status-delete-btn"
                      onClick={() => handleRemoveStatus(status.id)}
                    >
                      <RxTrash size={18} />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          <button
            type="button"
            className="add-status-btn"
            onClick={handleAddStatus}
          >
            <RxPlus />{" "}
            {language === "en" ? "Add new status" : "Додати новий статус"}
          </button>

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
