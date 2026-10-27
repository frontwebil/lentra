"use client";

import { Lead, Website } from "@/generated/prisma/client";
import { useSession } from "next-auth/react";
import { useState, useMemo } from "react";
import {
  FaStickyNote,
  FaHistory,
  FaRegClock,
  FaSave,
  FaArrowLeft,
} from "react-icons/fa";
import "./style.css";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import { DeleteLeadModal } from "./DeleteLeadModal/DeleteLeadModal";
import "../../SitesConfig/style.css";
import { STATUS_COLORS } from "@/dictionaries/status-colors";

export type LeadSchemaField = {
  key: string;
  label: string;
  type?: "text" | "number" | "boolean" | "date" | string;
};

export type NoteItem = {
  id: string;
  text: string;
  createdAt: string;
};

export type LeadLogItem = {
  type: string;
  time: string;
  text?: string;
};

type Props = {
  lead: Lead;
  website: Website;
};

type LeadStatus = {
  colorId: string;
  text: string;
};

const dictionary = {
  uk: {
    title: "Деталі ліда",
    received: "Отримано",
    schemaNotConfigured: "Схема полів для цього сайту ще не налаштована.",
    notSpecified: "Не вказано",
    yes: "Так",
    no: "Ні",
    notesTitle: "Нотатки менеджера",
    notesPlaceholder: "Введіть нотатки про цього ліда...",
    saveNotesBtn: "Додати нотатку",
    saving: "Збереження...",
    noNotes: "Нотаток поки немає.",
    noteAddedSuccess: "Нотатку успішно додано",
    noteAddedError: "Не вдалося зберегти нотатку",
    emptyNoteWarning: "Введіть текст нотатки",
    logsTitle: "Історія дій та логи",
    noLogs: "Записів в історії поки немає.",
    logTypes: {
      "created-lead": "Заявку отримано та створено в системі",
      "status-changed": "Змінено статус заявки",
      "note-added": "Додано нотатку",
    } as Record<string, string>,
  },
  en: {
    title: "Lead Details",
    received: "Received",
    schemaNotConfigured: "Field schema for this website is not configured yet.",
    notSpecified: "Not specified",
    yes: "Yes",
    no: "No",
    notesTitle: "Manager Notes",
    notesPlaceholder: "Enter notes for this lead...",
    saveNotesBtn: "Add Note",
    saving: "Saving...",
    noNotes: "No notes yet.",
    noteAddedSuccess: "Note added successfully",
    noteAddedError: "Failed to save note",
    emptyNoteWarning: "Please enter a note text",
    logsTitle: "Activity Logs & History",
    noLogs: "No activity records yet.",
    logTypes: {
      "created-lead": "Lead received and created in system",
      "status-changed": "Lead status updated",
      "note-added": "Note added",
    } as Record<string, string>,
  },
};

function parseNotes(
  rawNotes: unknown,
  fallbackDate: Date | string,
): NoteItem[] {
  if (!rawNotes) return [];

  let parsed = rawNotes;

  if (typeof rawNotes === "string" && rawNotes.trim()) {
    try {
      parsed = JSON.parse(rawNotes);
    } catch {
      return [
        {
          id: "1",
          text: rawNotes,
          createdAt: new Date(fallbackDate).toISOString(),
        },
      ];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed.map((item, idx) => {
      if (typeof item === "string") {
        return {
          id: String(idx),
          text: item,
          createdAt: new Date(fallbackDate).toISOString(),
        };
      }

      const dateValue =
        item.createdAt || item.time || item.date || fallbackDate;

      return {
        id: item.id || String(idx),
        text: item.text || "",
        createdAt: new Date(dateValue).toISOString(),
      };
    });
  }

  return [];
}

function parseLogs(rawLogs: unknown): LeadLogItem[] {
  if (!rawLogs) return [];

  let parsed = rawLogs;

  if (typeof rawLogs === "string" && rawLogs.trim()) {
    try {
      parsed = JSON.parse(rawLogs);
    } catch {
      return [];
    }
  }

  if (Array.isArray(parsed)) {
    return parsed as LeadLogItem[];
  }

  return [];
}

function formatFieldValue(
  value: unknown,
  t: typeof dictionary.uk,
): React.ReactNode {
  if (value === null || value === undefined || value === "") {
    return <span className="lead-empty-text">{t.notSpecified}</span>;
  }

  if (typeof value === "boolean") {
    return value ? (
      <span className="badge badge-success">{t.yes}</span>
    ) : (
      <span className="badge badge-danger">{t.no}</span>
    );
  }

  if (Array.isArray(value)) {
    return value.length > 0 ? (
      value.join(", ")
    ) : (
      <span className="lead-empty-text">{t.notSpecified}</span>
    );
  }

  if (typeof value === "object") {
    return <pre className="json-code">{JSON.stringify(value, null, 2)}</pre>;
  }

  return String(value);
}

export function LeadPage({ lead, website }: Props) {
  const { data: session } = useSession();
  const language = (session?.user?.language as "uk" | "en") || "uk";
  const t = useMemo(() => dictionary[language] || dictionary.uk, [language]);

  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [newNoteField, setNewNoteField] = useState("");

  const [notes, setNotes] = useState<NoteItem[]>(() =>
    parseNotes(lead.notes, lead.createdAt),
  );

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  const [logs, setLogs] = useState<LeadLogItem[]>(() => parseLogs(lead.logs));

  const schema = (Array.isArray(website.leadSchema)
    ? website.leadSchema
    : []) as unknown as LeadSchemaField[];

  const fields = (
    lead.fields &&
    typeof lead.fields === "object" &&
    !Array.isArray(lead.fields)
      ? lead.fields
      : {}
  ) as Record<string, unknown>;

  const formatDate = (date: Date | string) =>
    new Date(date).toLocaleString(language === "en" ? "en-GB" : "uk-UA", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

  const handleSaveNotes = async () => {
    const trimmedText = newNoteField.trim();
    if (!trimmedText) {
      toast.error(t.emptyNoteWarning);
      return;
    }

    setIsSavingNotes(true);
    try {
      const res = await axios.post("/api/crm/update-notes", {
        note: trimmedText,
        leadId: lead.id,
      });

      const nowIso = new Date().toISOString();
      const createdNote: NoteItem = res.data?.note || {
        id: Date.now().toString(),
        text: trimmedText,
        createdAt: nowIso,
      };

      setNotes((prev) => [createdNote, ...prev]);

      // Оновлення логів у стейті
      if (res.data?.logs && Array.isArray(res.data.logs)) {
        setLogs(res.data.logs);
      } else {
        const truncated =
          trimmedText.length > 35
            ? `${trimmedText.slice(0, 35)}...`
            : trimmedText;
        const newLogItem: LeadLogItem = {
          type: "note-added",
          time: nowIso,
          text: `${language === "uk" ? "Додано нотатку" : "Note added"}: "${truncated}"`,
        };
        setLogs((prev) => [newLogItem, ...prev]);
      }

      setNewNoteField("");
      toast.success(t.noteAddedSuccess);
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error(t.noteAddedError);
    } finally {
      setIsSavingNotes(false);
    }
  };

  const status = lead.status as LeadStatus;

  return (
    <div className="lead-container">
      {isOpenDeleteModal && (
        <DeleteLeadModal
          language={language}
          setIsOpenDeleteModal={setIsOpenDeleteModal}
          leadId={lead.id}
          xSiteId={website.xSiteId}
        />
      )}
      <div className="lead-top-nav">
        <Link
          href={`/dashboard/leads/${website.xSiteId}`}
          className="lead-back-button"
        >
          <FaArrowLeft className="back-icon" />
          <span>{language === "uk" ? "Назад до лідів" : "Back to leads"}</span>
        </Link>

        <div className="lead-top-actions">
          <button className="lead-edit-button">
            {language === "uk" ? "Редагувати" : "Edit"}
          </button>

          <button
            className="lead-delete-button"
            onClick={() => setIsOpenDeleteModal(true)}
          >
            {language === "uk" ? "Видалити" : "Delete"}
          </button>
        </div>
      </div>
      <div className="lead-header">
        <div>
          <h1 className="lead-title">{t.title}</h1>
          <p className="lead-subtitle">
            {t.received}: {formatDate(lead.createdAt)}
          </p>
        </div>
        <div className="lead-header-right">
          {(() => {
            const colors = STATUS_COLORS.find((el) => el.id === status.colorId);

            return (
              <span
                className={`status-badge ${status.colorId}`}
                style={{
                  backgroundColor: colors?.bg,
                  color: colors?.text,
                }}
              >
                {status.text}
              </span>
            );
          })()}
          <div className="lead-badge-id">ID: {lead.id}</div>
        </div>
      </div>

      <div className="lead-dashboard-layout">
        <div className="lead-main-column">
          <div className="lead-block-card">
            {schema.length === 0 ? (
              <div className="lead-empty-state">{t.schemaNotConfigured}</div>
            ) : (
              <dl className="lead-grid">
                {schema.map((f) => {
                  const rawValue = fields[f.key];
                  return (
                    <div key={f.key} className="lead-field-card">
                      <dt className="lead-field-label">{f.label || f.key}</dt>
                      <dd className="lead-field-value">
                        {formatFieldValue(rawValue, t)}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            )}
          </div>

          <div className="lead-block-card">
            <div className="block-card-header">
              <FaStickyNote className="header-icon" />
              <h3>{t.notesTitle}</h3>
            </div>

            <div className="add-note-form">
              <textarea
                placeholder={t.notesPlaceholder}
                rows={4}
                value={newNoteField}
                onChange={(e) => setNewNoteField(e.target.value)}
              />
              {newNoteField.length > 0 && (
                <button
                  type="button"
                  className="lead-primary-button"
                  onClick={handleSaveNotes}
                  disabled={isSavingNotes}
                >
                  <FaSave />
                  <span>{isSavingNotes ? t.saving : t.saveNotesBtn}</span>
                </button>
              )}
            </div>

            <div className="notes-list" style={{ marginTop: "1.5rem" }}>
              {notes.length === 0 ? (
                <p className="lead-empty-text">{t.noNotes}</p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="note-card"
                    style={{ marginBottom: "1rem" }}
                  >
                    <p className="note-text">{note.text}</p>
                    {note.createdAt && (
                      <div
                        className="note-meta"
                        style={{
                          fontSize: "0.8rem",
                          opacity: 0.7,
                          marginTop: "0.4rem",
                        }}
                      >
                        <FaRegClock
                          style={{ display: "inline", marginRight: "4px" }}
                        />
                        {formatDate(note.createdAt)}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lead-side-column">
          <div className="lead-block-card">
            <div className="block-card-header">
              <FaHistory className="header-icon" />
              <h3>{t.logsTitle}</h3>
            </div>

            <div className="logs-timeline">
              {logs.length === 0 ? (
                <p className="lead-empty-text">{t.noLogs}</p>
              ) : (
                logs.map((log, index) => {
                  const actionText =
                    log.text || t.logTypes[log.type] || log.type;

                  return (
                    <div key={index} className="log-item">
                      <div className="log-bullet" />
                      <div className="log-content">
                        <p className="log-action">{actionText}</p>
                        <div className="log-meta">
                          <span className="log-time">
                            <FaRegClock /> {formatDate(log.time)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
