"use client";

import { Lead, Website } from "@/generated/prisma/client";
import { useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { RxCross2 } from "react-icons/rx";
import { FaSave } from "react-icons/fa";
import { STATUS_COLORS } from "@/dictionaries/status-colors";
import { LeadSchemaField } from "../LeadPage";
import "./style.css";

type StatusItem = {
  id: string;
  name: string;
  colorId: string;
};

type Props = {
  lead: Lead;
  website: Website;
  language: "uk" | "en";
  schema: LeadSchemaField[];
  onClose: () => void;
  onSaved: (data: {
    fields: Record<string, unknown>;
    status: { text: string; colorId: string };
    logs: { type: string; time: string; text?: string }[];
  }) => void;
};

type LeadStatus = {
  text: string;
  colorId: string;
};

export function EditLeadModal({
  lead,
  website,
  language,
  schema,
  onClose,
  onSaved,
}: Props) {
  const [loading, setLoading] = useState(false);

  const initialFields =
    lead.fields &&
    typeof lead.fields === "object" &&
    !Array.isArray(lead.fields)
      ? (lead.fields as Record<string, unknown>)
      : {};

  const initialStatus =
    lead.status &&
    typeof lead.status === "object" &&
    !Array.isArray(lead.status)
      ? (lead.status as unknown as LeadStatus)
      : { text: "New", colorId: "new" };

  const [fields, setFields] = useState<Record<string, unknown>>(initialFields);

  const [status, setStatus] = useState<LeadStatus>(initialStatus);

  const statuses = (Array.isArray(website.statuses)
    ? website.statuses
    : []) as unknown as StatusItem[];

  const currentStatusExists =
    status.colorId === "new" ||
    statuses.some(
      (item) => item.name === status.text && item.colorId === status.colorId,
    );

  const availableStatuses: LeadStatus[] = [
    {
      text: "New",
      colorId: "new",
    },
    ...statuses.map((item) => ({
      text: item.name,
      colorId: item.colorId,
    })),
  ];

  if (!currentStatusExists && status.text) {
    availableStatuses.push(status);
  }

  const t =
    language === "uk"
      ? {
          title: "Редагування ліда",
          status: "Статус заявки",
          save: "Зберегти зміни",
          saving: "Збереження...",
          cancel: "Скасувати",
          success: "Ліда успішно оновлено",
          error: "Не вдалося оновити ліда",
          notConfigured: "Для цього сайту немає налаштованих полів.",
          newStatus: "Новий",
        }
      : {
          title: "Edit Lead",
          status: "Lead status",
          save: "Save changes",
          saving: "Saving...",
          cancel: "Cancel",
          success: "Lead updated successfully",
          error: "Failed to update lead",
          notConfigured: "No fields are configured for this website.",
          newStatus: "New",
        };

  const updateField = (key: string, value: unknown) => {
    setFields((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    if (loading) return;

    setLoading(true);

    try {
      const response = await axios.patch("/api/crm/update-lead", {
        leadId: lead.id,
        xSiteId: website.xSiteId,
        fields,
        status,
      });

      onSaved(response.data);
      toast.success(t.success);
      onClose();
    } catch (error) {
      console.error("Error updating lead:", error);
      toast.error(
        axios.isAxiosError(error)
          ? error.response?.data?.message || t.error
          : t.error,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="dashboard-modal-overlay edit-modal-overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !loading) {
          onClose();
        }
      }}
    >
      {loading && (
        <div className="widget-loader">
          <div className="loader" style={{ borderTopColor: "#000" }} />
        </div>
      )}

      <div className="edit-modal" onMouseDown={(e) => e.stopPropagation()}>
        <div className="edit-modal-header">
          <h2>{t.title}</h2>

          <button
            type="button"
            className="edit-modal-close"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
          >
            <RxCross2 />
          </button>
        </div>

        <div className="edit-modal-body">
          {schema.length === 0 ? (
            <p className="lead-empty-text">{t.notConfigured}</p>
          ) : (
            schema.map((field) => {
              const value = fields[field.key];

              return (
                <div className="edit-lead-field" key={field.key}>
                  <label htmlFor={`edit-${field.key}`}>
                    {field.label || field.key}
                  </label>

                  {field.type === "boolean" ? (
                    <label className="edit-lead-checkbox">
                      <input
                        id={`edit-${field.key}`}
                        type="checkbox"
                        checked={value === true}
                        onChange={(e) =>
                          updateField(field.key, e.target.checked)
                        }
                        disabled={loading}
                      />

                      <span>
                        {value === true
                          ? language === "uk"
                            ? "Так"
                            : "Yes"
                          : language === "uk"
                            ? "Ні"
                            : "No"}
                      </span>
                    </label>
                  ) : (
                    <input
                      id={`edit-${field.key}`}
                      type={
                        ["text", "number", "date", "time"].includes(
                          field.type || "text",
                        )
                          ? field.type
                          : "text"
                      }
                      value={
                        field.type === "date" && value
                          ? String(value).slice(0, 10)
                          : value === null || value === undefined
                            ? ""
                            : String(value)
                      }
                      onChange={(e) => {
                        const nextValue =
                          field.type === "number"
                            ? e.target.value === ""
                              ? ""
                              : Number(e.target.value)
                            : e.target.value;

                        updateField(field.key, nextValue);
                      }}
                      disabled={loading}
                    />
                  )}
                </div>
              );
            })
          )}

          <div className="edit-lead-field">
            <label htmlFor="edit-lead-status">{t.status}</label>

            <select
              id="edit-lead-status"
              value={JSON.stringify(status)}
              onChange={(e) => {
                setStatus(JSON.parse(e.target.value) as LeadStatus);
              }}
              disabled={loading}
            >
              {availableStatuses.map((item, index) => {
                const colors = STATUS_COLORS.find(
                  (color) => color.id === item.colorId,
                );

                return (
                  <option
                    key={`${item.colorId}-${item.text}-${index}`}
                    value={JSON.stringify(item)}
                    style={{
                      backgroundColor: colors?.bg,
                      color: colors?.text,
                    }}
                  >
                    {item.colorId === "new" ? t.newStatus : item.text}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="edit-modal-actions">
            <button
              type="button"
              className="edit-modal-cancel"
              onClick={onClose}
              disabled={loading}
            >
              {t.cancel}
            </button>

            <button
              type="button"
              className="lead-primary-button"
              onClick={handleSave}
              disabled={loading}
            >
              <FaSave />
              <span>{loading ? t.saving : t.save}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
