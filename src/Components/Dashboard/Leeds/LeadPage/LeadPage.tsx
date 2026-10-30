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
  FaUserPlus,
  FaLink,
} from "react-icons/fa";
import "./style.css";
import axios from "axios";
import { toast } from "sonner";
import Link from "next/link";
import { DeleteLeadModal } from "./DeleteLeadModal/DeleteLeadModal";
import "../../SitesConfig/style.css";
import { STATUS_COLORS } from "@/dictionaries/status-colors";
import { normalizeLeadStatus } from "../LeedsPage/LeedsPage";
import { EditLeadModal } from "./EditLeadModal/EditLeadModal";

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
  client?: { id: string; name: string; phone: string | null } | null;
};

type ClientSummary = { id: string; name: string; phone: string | null; _count?: { leads: number } };

const dictionary = {
  uk: {
    title: "Деталі ліда",
    clientSection: "Клієнт",
    createClient: "Створити клієнта на основі заявки",
    linkClient: "Прив’язати до наявного клієнта",
    changeClient: "Змінити клієнта",
    linkedTo: "Заявка прив’язана до клієнта",
    createClientTitle: "Створення клієнта",
    linkClientTitle: "Виберіть клієнта",
    clientName: "Ім’я клієнта",
    phoneField: "Поле з номером телефону",
    matchPhoneLeads: "Прив’язати інші заявки з таким самим номером телефону",
    noPhoneField: "У схемі сайту не знайдено поле телефону. Інші заявки не будуть зіставлятися автоматично.",
    searchClients: "Пошук за ім’ям або телефоном",
    noClients: "Клієнтів поки немає. Створіть клієнта із заявки.",
    saveClient: "Створити клієнта",
    linkSelected: "Прив’язати заявку",
    cancel: "Скасувати",
    clientCreated: "Клієнта створено й прив’язано до заявки",
    clientLinked: "Заявку прив’язано до клієнта",
    clientActionError: "Не вдалося виконати дію з клієнтом",
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
    clientSection: "Client",
    createClient: "Create client from this lead",
    linkClient: "Link to an existing client",
    changeClient: "Change client",
    linkedTo: "Lead linked to client",
    createClientTitle: "Create client",
    linkClientTitle: "Choose a client",
    clientName: "Client name",
    phoneField: "Phone number field",
    matchPhoneLeads: "Link other leads with the same phone number",
    noPhoneField: "No phone field was found in this website schema. Other leads will not be matched automatically.",
    searchClients: "Search by name or phone",
    noClients: "There are no clients yet. Create a client from a lead.",
    saveClient: "Create client",
    linkSelected: "Link lead",
    cancel: "Cancel",
    clientCreated: "Client created and linked to this lead",
    clientLinked: "Lead linked to client",
    clientActionError: "Could not complete the client action",
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

export function LeadPage({ lead, website, client: initialClient = null }: Props) {
  const { data: session } = useSession();
  const language = (session?.user?.language as "uk" | "en") || "uk";
  const t = useMemo(() => dictionary[language] || dictionary.uk, [language]);

  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [newNoteField, setNewNoteField] = useState("");

  const [notes, setNotes] = useState<NoteItem[]>(() =>
    parseNotes(lead.notes, lead.createdAt),
  );

  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);

  const [currentFields, setCurrentFields] = useState<Record<string, unknown>>(
    () =>
      lead.fields &&
      typeof lead.fields === "object" &&
      !Array.isArray(lead.fields)
        ? (lead.fields as Record<string, unknown>)
        : {},
  );

  const [currentStatus, setCurrentStatus] = useState(lead.status);

  const [logs, setLogs] = useState<LeadLogItem[]>(() => parseLogs(lead.logs));

  const schema = (Array.isArray(website.leadSchema)
    ? website.leadSchema
    : []) as unknown as LeadSchemaField[];

  const fields = currentFields;
  const phoneFields = schema.filter((field) => /phone|mobile|tel|телефон|мобіль/i.test(`${field.key} ${field.label ?? ""}`));
  const suggestedNameField = schema.find((field) => /name|ім.?я|піб|contact/i.test(`${field.key} ${field.label ?? ""}`));
  const suggestedPhoneField = phoneFields[0];
  const [client, setClient] = useState<ClientSummary | null>(initialClient);
  const [clientDialog, setClientDialog] = useState<"create" | "link" | null>(null);
  const [clients, setClients] = useState<ClientSummary[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [clientName, setClientName] = useState(() => {
    const name = suggestedNameField ? String(currentFields[suggestedNameField.key] ?? "").trim() : "";
    const phone = suggestedPhoneField ? String(currentFields[suggestedPhoneField.key] ?? "").trim() : "";
    return name || phone;
  });
  const [phoneFieldKey, setPhoneFieldKey] = useState(suggestedPhoneField?.key ?? "");
  const [attachMatchingLeads, setAttachMatchingLeads] = useState(true);
  const [isSavingClient, setIsSavingClient] = useState(false);

  const openClientDialog = async (mode: "create" | "link") => {
    setClientDialog(mode);
    setClientSearch("");
    if (mode === "create") {
      const name = suggestedNameField ? String(currentFields[suggestedNameField.key] ?? "").trim() : "";
      const phone = suggestedPhoneField ? String(currentFields[suggestedPhoneField.key] ?? "").trim() : "";
      setClientName(name || phone);
      setPhoneFieldKey(suggestedPhoneField?.key ?? "");
      setAttachMatchingLeads(true);
      return;
    }
    try {
      const response = await axios.get("/api/crm/clients");
      setClients(response.data.clients ?? []);
      setSelectedClientId(client?.id ?? "");
    } catch {
      toast.error(t.clientActionError);
      setClientDialog(null);
    }
  };

  const handleCreateClient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSavingClient(true);
    try {
      const response = await axios.post("/api/crm/clients", {
        leadId: lead.id,
        name: clientName.trim(),
        phoneFieldKey,
        attachMatchingLeads: attachMatchingLeads && Boolean(phoneFieldKey),
      });
      setClient(response.data.client);
      setClientDialog(null);
      const linkedLeads = response.data.linkedLeads ?? 1;
      toast.success(linkedLeads > 1 ? `${t.clientCreated} (${linkedLeads})` : t.clientCreated);
    } catch (error) {
      console.error("Create client error:", error);
      toast.error(t.clientActionError);
    } finally {
      setIsSavingClient(false);
    }
  };

  const handleLinkClient = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClientId) return;
    setIsSavingClient(true);
    try {
      await axios.post("/api/crm/clients/link", { leadId: lead.id, clientId: selectedClientId });
      const selected = clients.find((item) => item.id === selectedClientId);
      if (selected) setClient(selected);
      setClientDialog(null);
      toast.success(t.clientLinked);
    } catch (error) {
      console.error("Link client error:", error);
      toast.error(t.clientActionError);
    } finally {
      setIsSavingClient(false);
    }
  };

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

  const status = normalizeLeadStatus(currentStatus, language);

  return (
    <div className="lead-container">
      {clientDialog && (
        <div className="client-dialog-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setClientDialog(null); }}>
          <section className="client-dialog" role="dialog" aria-modal="true" aria-labelledby="client-dialog-title">
            <div className="client-dialog-header">
              <h2 id="client-dialog-title">{clientDialog === "create" ? t.createClientTitle : t.linkClientTitle}</h2>
              <button type="button" onClick={() => setClientDialog(null)} aria-label={t.cancel}>×</button>
            </div>
            {clientDialog === "create" ? (
              <form onSubmit={handleCreateClient} className="client-dialog-form">
                <label>{t.clientName}<input value={clientName} onChange={(event) => setClientName(event.target.value)} required /></label>
                {phoneFields.length > 0 ? (
                  <>
                    <label>{t.phoneField}<select value={phoneFieldKey} onChange={(event) => setPhoneFieldKey(event.target.value)}>
                      {phoneFields.map((field) => <option key={field.key} value={field.key}>{field.label || field.key}</option>)}
                    </select></label>
                    <label className="client-match-option"><input type="checkbox" checked={attachMatchingLeads} onChange={(event) => setAttachMatchingLeads(event.target.checked)} /><span>{t.matchPhoneLeads}</span></label>
                  </>
                ) : <p className="client-dialog-hint">{t.noPhoneField}</p>}
                <div className="client-dialog-actions">
                  <button type="button" className="client-secondary-button" onClick={() => setClientDialog(null)}>{t.cancel}</button>
                  <button type="submit" className="client-primary-button" disabled={isSavingClient || !clientName.trim()}>{isSavingClient ? t.saving : t.saveClient}</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLinkClient} className="client-dialog-form">
                <input className="client-search-input" value={clientSearch} onChange={(event) => setClientSearch(event.target.value)} placeholder={t.searchClients} />
                <div className="client-options-list">
                  {clients.filter((item) => `${item.name} ${item.phone ?? ""}`.toLowerCase().includes(clientSearch.toLowerCase())).map((item) => (
                    <label className={`client-option ${selectedClientId === item.id ? "selected" : ""}`} key={item.id}>
                      <input type="radio" name="existing-client" value={item.id} checked={selectedClientId === item.id} onChange={() => setSelectedClientId(item.id)} />
                      <span><strong>{item.name}</strong>{item.phone && <small>{item.phone}</small>}</span>
                    </label>
                  ))}
                  {clients.filter((item) => `${item.name} ${item.phone ?? ""}`.toLowerCase().includes(clientSearch.toLowerCase())).length === 0 && <p className="client-dialog-hint">{t.noClients}</p>}
                </div>
                <div className="client-dialog-actions">
                  <button type="button" className="client-secondary-button" onClick={() => setClientDialog(null)}>{t.cancel}</button>
                  <button type="submit" className="client-primary-button" disabled={isSavingClient || !selectedClientId}>{isSavingClient ? t.saving : t.linkSelected}</button>
                </div>
              </form>
            )}
          </section>
        </div>
      )}
      {isOpenDeleteModal && (
        <DeleteLeadModal
          language={language}
          setIsOpenDeleteModal={setIsOpenDeleteModal}
          leadId={lead.id}
          xSiteId={website.xSiteId}
        />
      )}
      {isOpenEditModal && (
        <EditLeadModal
          lead={{
            ...lead,
            fields: currentFields as Lead["fields"],
            status: currentStatus as Lead["status"],
            logs: logs as Lead["logs"],
          }}
          website={website}
          language={language}
          schema={schema}
          onClose={() => setIsOpenEditModal(false)}
          onSaved={(data) => {
            setCurrentFields(data.fields);
            setCurrentStatus(data.status);
            setLogs(data.logs);
          }}
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
          <button
            className="lead-edit-button"
            onClick={() => setIsOpenEditModal(true)}
          >
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

      <section className="lead-client-card">
        <div className="lead-client-info">
          <span className="lead-client-icon"><FaLink /></span>
          <div>
            <strong>{t.clientSection}</strong>
            <p>{client ? <>{t.linkedTo}: <Link className="lead-client-link" href={`/dashboard/clients/${client.id}`}>{client.name}</Link>{client.phone ? ` · ${client.phone}` : ""}</> : (language === "uk" ? "Заявка ще не прив’язана до клієнта" : "This lead is not linked to a client yet")}</p>
          </div>
        </div>
        <div className="lead-client-actions">
          {!client && <button type="button" onClick={() => void openClientDialog("create")}><FaUserPlus />{t.createClient}</button>}
          <button type="button" className="secondary" onClick={() => void openClientDialog("link")}><FaLink />{client ? t.changeClient : t.linkClient}</button>
        </div>
      </section>

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
