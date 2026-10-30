"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FaSearch, FaUsers, FaStickyNote, FaPercent, FaPlus, FaTrash } from "react-icons/fa";
import { toast } from "sonner";
import "./style.css";

type ClientLead = { id: string; createdAt: string; fields: unknown; website: { websiteName: string; leadSchema: unknown } };
type ClientRecord = {
  id: string;
  name: string;
  phone: string | null;
  fields: Record<string, unknown>;
  notes: string | null;
  discountPercent: number | null;
  _count: { leads: number };
  leads: ClientLead[];
};

export function Clients({ initialClientId }: { initialClientId?: string }) {
  const router = useRouter();
  const { data: session } = useSession();
  const language = session?.user.language === "en" ? "en" : "uk";
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [discount, setDiscount] = useState("");
  const [clientInfoFields, setClientInfoFields] = useState<Record<string, unknown>>({});
  const [existingFieldKey, setExistingFieldKey] = useState("");
  const [customFieldLabel, setCustomFieldLabel] = useState("");
  const [customFieldValue, setCustomFieldValue] = useState("");
  const [isEditingClientInfo, setIsEditingClientInfo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingClientInfo, setSavingClientInfo] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const selectedClient = clients.find((client) => client.id === selectedId) ?? null;
  const visibleClients = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return clients.filter((client) => `${client.name} ${client.phone ?? ""}`.toLocaleLowerCase().includes(query));
  }, [clients, search]);

  useEffect(() => {
    axios.get("/api/crm/clients")
      .then(({ data }) => {
        const records: ClientRecord[] = data.clients ?? [];
        setClients(records);
        const initialClient = records.find((client) => client.id === initialClientId) ?? records[0];
        setSelectedId(initialClient?.id ?? "");
        setNotes(initialClient?.notes ?? "");
        setDiscount(initialClient?.discountPercent == null ? "" : String(initialClient.discountPercent));
        setClientInfoFields(initialClient?.fields ?? {});
      })
      .catch(() => toast.error(language === "en" ? "Could not load clients" : "Не вдалося завантажити клієнтів"))
      .finally(() => setLoading(false));
  }, [language, initialClientId]);

  const saveDetails = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedClient) return;
    const discountPercent = discount.trim() === "" ? null : Number(discount);
    if (discountPercent !== null && (!Number.isFinite(discountPercent) || discountPercent < 0 || discountPercent > 100)) {
      toast.error(language === "en" ? "Discount must be between 0 and 100%" : "Знижка має бути від 0 до 100%" );
      return;
    }
    setSaving(true);
    try {
      const { data } = await axios.patch(`/api/crm/clients/${selectedClient.id}`, { notes, discountPercent });
      setClients((current) => current.map((client) => client.id === selectedClient.id
        ? { ...client, notes: data.client.notes, discountPercent: data.client.discountPercent }
        : client));
      toast.success(language === "en" ? "Client details saved" : "Дані клієнта збережено");
    } catch {
      toast.error(language === "en" ? "Could not save client details" : "Не вдалося зберегти дані клієнта");
    } finally {
      setSaving(false);
    }
  };

  const saveClientInformation = async () => {
    if (!selectedClient) return;
    setSavingClientInfo(true);
    try {
      await axios.patch(`/api/crm/clients/${selectedClient.id}`, { fields: clientInfoFields });
      setClients((current) => current.map((client) => client.id === selectedClient.id
        ? { ...client, fields: clientInfoFields }
        : client));
      setIsEditingClientInfo(false);
      toast.success(language === "en" ? "Client information saved" : "Дані клієнта збережено");
    } catch {
      toast.error(language === "en" ? "Could not save client information" : "Не вдалося зберегти дані клієнта");
    } finally {
      setSavingClientInfo(false);
    }
  };

  const deleteClient = async () => {
    if (!selectedClient) return;
    const confirmed = window.confirm(language === "en"
      ? `Delete ${selectedClient.name}? Its leads will stay in CRM but will no longer be linked to this client.`
      : `Видалити клієнта «${selectedClient.name}»? Заявки залишаться в CRM, але більше не будуть прив’язані до нього.`);
    if (!confirmed) return;
    setDeleting(true);
    try {
      await axios.delete(`/api/crm/clients/${selectedClient.id}`);
      const remaining = clients.filter((client) => client.id !== selectedClient.id);
      setClients(remaining);
      const nextClient = remaining[0] ?? null;
      setSelectedId(nextClient?.id ?? "");
      setNotes(nextClient?.notes ?? "");
      setDiscount(nextClient?.discountPercent == null ? "" : String(nextClient.discountPercent));
      setClientInfoFields(nextClient?.fields ?? {});
      setIsEditingClientInfo(false);
      toast.success(language === "en" ? "Client deleted" : "Клієнта видалено");
      router.replace(nextClient ? `/dashboard/clients/${nextClient.id}` : "/dashboard/clients");
    } catch {
      toast.error(language === "en" ? "Could not delete client" : "Не вдалося видалити клієнта");
    } finally {
      setDeleting(false);
    }
  };

  const dateLabel = (value: string) => new Date(value).toLocaleDateString(language === "en" ? "en-GB" : "uk-UA", { day: "numeric", month: "short", year: "numeric" });
  const clientFieldLabels = new Map<string, string>();
  selectedClient?.leads.forEach((lead) => {
    if (!Array.isArray(lead.website.leadSchema)) return;
    lead.website.leadSchema.forEach((field) => {
      if (field && typeof field === "object" && "key" in field && typeof field.key === "string") {
        const schemaField = field as { key: string; label?: unknown };
        clientFieldLabels.set(schemaField.key, typeof schemaField.label === "string" && schemaField.label ? schemaField.label : schemaField.key);
      }
    });
  });
  const clientFields = selectedClient ? Object.entries(clientInfoFields) : [];
  const displayFieldValue = (value: unknown) => Array.isArray(value) ? value.join(", ") : typeof value === "object" && value !== null ? JSON.stringify(value) : String(value);
  const availableLeadFields = new Map<string, { label: string; value: unknown }>();
  selectedClient?.leads.forEach((lead) => {
    const leadValues = lead.fields && typeof lead.fields === "object" && !Array.isArray(lead.fields) ? lead.fields as Record<string, unknown> : {};
    if (!Array.isArray(lead.website.leadSchema)) return;
    lead.website.leadSchema.forEach((field) => {
      if (!field || typeof field !== "object" || !("key" in field) || typeof field.key !== "string") return;
      if (!Object.prototype.hasOwnProperty.call(leadValues, field.key) || leadValues[field.key] == null || leadValues[field.key] === "") return;
      const schemaField = field as { key: string; label?: unknown };
      if (!availableLeadFields.has(schemaField.key)) availableLeadFields.set(schemaField.key, {
        label: typeof schemaField.label === "string" && schemaField.label ? schemaField.label : schemaField.key,
        value: leadValues[schemaField.key],
      });
    });
  });
  const addExistingField = () => {
    const field = availableLeadFields.get(existingFieldKey);
    if (!field) return;
    setClientInfoFields((current) => ({ ...current, [existingFieldKey]: field.value }));
    setExistingFieldKey("");
  };
  const addCustomField = () => {
    const label = customFieldLabel.trim();
    if (!label) return;
    if (Object.prototype.hasOwnProperty.call(clientInfoFields, label)) {
      toast.error(language === "en" ? "This field already exists" : "Таке поле вже є");
      return;
    }
    setClientInfoFields((current) => ({ ...current, [label]: customFieldValue }));
    setCustomFieldLabel("");
    setCustomFieldValue("");
  };

  return (
    <main className="clients-page">
      <header className="clients-heading">
        <div>
          <h1 className="dashboard-page-title dashboard-semibold">{language === "en" ? "Clients" : "Клієнти"}</h1>
          <p className="dashboard-page-description">{language === "en" ? "Client profiles created from your leads" : "Картки клієнтів, створені із заявок"}</p>
        </div>
        <div className="clients-total"><FaUsers /><span>{clients.length} {language === "en" ? "clients" : "клієнтів"}</span></div>
      </header>

      <div className="clients-workspace">
        <section className="clients-list-panel">
          <label className="clients-search"><FaSearch /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={language === "en" ? "Search clients" : "Пошук клієнтів"} /></label>
          <div className="clients-list">
            {loading ? <p className="clients-empty">{language === "en" ? "Loading clients…" : "Завантажуємо клієнтів…"}</p> : visibleClients.map((client) => (
              <button key={client.id} type="button" className={`client-list-item ${selectedId === client.id ? "active" : ""}`} onClick={() => { setSelectedId(client.id); setNotes(client.notes ?? ""); setDiscount(client.discountPercent == null ? "" : String(client.discountPercent)); setClientInfoFields(client.fields ?? {}); setIsEditingClientInfo(false); setExistingFieldKey(""); setCustomFieldLabel(""); setCustomFieldValue(""); }}>
                <span className="client-avatar">{client.name.trim().slice(0, 1).toLocaleUpperCase() || "?"}</span>
                <span className="client-list-copy"><strong>{client.name}</strong><small>{client.phone || (language === "en" ? "No phone number" : "Телефон не вказано")}</small></span>
                <span className="client-lead-count">{client._count.leads}</span>
              </button>
            ))}
            {!loading && visibleClients.length === 0 && <p className="clients-empty">{clients.length === 0
              ? (language === "en" ? "Clients appear here when you create them from a lead." : "Клієнти з’являтимуться тут після створення з заявки.")
              : (language === "en" ? "No clients match your search." : "За цим запитом клієнтів не знайдено.")}</p>}
          </div>
        </section>

        {selectedClient ? (
      <section className="client-detail-panel">
            <div className="client-detail-heading">
              <span className="client-avatar large">{selectedClient.name.trim().slice(0, 1).toLocaleUpperCase() || "?"}</span>
              <div><h2>{selectedClient.name}</h2><p>{selectedClient.phone || (language === "en" ? "No phone number" : "Телефон не вказано")}</p></div>
              <button type="button" className="client-delete-button" onClick={() => void deleteClient()} disabled={deleting} title={language === "en" ? "Delete client" : "Видалити клієнта"}>
                <FaTrash />{deleting ? (language === "en" ? "Deleting…" : "Видалення…") : (language === "en" ? "Delete" : "Видалити")}
              </button>
            </div>
            <div className="client-detail-stats">
              <div><strong>{selectedClient._count.leads}</strong><span>{language === "en" ? "Linked leads" : "Пов’язані заявки"}</span></div>
              <div><strong>{selectedClient.discountPercent == null ? "—" : `${selectedClient.discountPercent}%`}</strong><span>{language === "en" ? "Discount" : "Знижка"}</span></div>
            </div>

            <section className="client-information-editor">
              <header className="client-information-header">
                <div>
                  <h3>{language === "en" ? "Client information" : "Дані клієнта"}</h3>
                  {isEditingClientInfo && <p>{language === "en" ? "Fields from linked leads are available to add, and you can create custom fields." : "Можна додати поля з пов’язаних заявок або створити власні."}</p>}
                </div>
                {!isEditingClientInfo && <button type="button" className="client-edit-button" onClick={() => setIsEditingClientInfo(true)}>{language === "en" ? "Edit" : "Редагувати"}</button>}
              </header>
              {!isEditingClientInfo ? (
                <table className="client-information-table">
                  <thead><tr><th>{language === "en" ? "Field" : "Поле"}</th><th>{language === "en" ? "Value" : "Значення"}</th></tr></thead>
                  <tbody>{clientFields.length ? clientFields.map(([key, value]) => <tr key={key}><th>{clientFieldLabels.get(key) ?? key}</th><td>{displayFieldValue(value)}</td></tr>) : <tr><td colSpan={2}>{language === "en" ? "No client information yet." : "Даних клієнта ще немає."}</td></tr>}</tbody>
                </table>
              ) : (
                <>
                  <div className="client-information-fields">
                    {clientFields.map(([key, value]) => <label className="client-information-field" key={key}>
                      <span>{clientFieldLabels.get(key) ?? key}</span>
                      <input value={displayFieldValue(value)} onChange={(event) => setClientInfoFields((current) => ({ ...current, [key]: event.target.value }))} />
                      <button type="button" onClick={() => setClientInfoFields((current) => { const next = { ...current }; delete next[key]; return next; })} aria-label={language === "en" ? `Remove ${key}` : `Прибрати поле ${key}`}>×</button>
                    </label>)}
                  </div>
                  <div className="client-add-existing-field">
                    <select value={existingFieldKey} onChange={(event) => setExistingFieldKey(event.target.value)}>
                      <option value="">{language === "en" ? "Choose a field from a lead" : "Вибрати поле із заявки"}</option>
                      {Array.from(availableLeadFields.entries()).filter(([key]) => !Object.prototype.hasOwnProperty.call(clientInfoFields, key)).map(([key, field]) => <option key={key} value={key}>{field.label}</option>)}
                    </select>
                    <button type="button" onClick={addExistingField} disabled={!existingFieldKey}><FaPlus />{language === "en" ? "Add existing" : "Додати існуюче"}</button>
                  </div>
                  <div className="client-add-custom-field">
                    <input value={customFieldLabel} onChange={(event) => setCustomFieldLabel(event.target.value)} placeholder={language === "en" ? "New field name" : "Назва нового поля"} />
                    <input value={customFieldValue} onChange={(event) => setCustomFieldValue(event.target.value)} placeholder={language === "en" ? "Value" : "Значення"} />
                    <button type="button" onClick={addCustomField} disabled={!customFieldLabel.trim()}><FaPlus />{language === "en" ? "Add custom" : "Додати власне"}</button>
                  </div>
                  <div className="client-information-actions">
                    <button type="button" className="client-cancel-button" onClick={() => { setClientInfoFields(selectedClient.fields ?? {}); setIsEditingClientInfo(false); }}>{language === "en" ? "Cancel" : "Скасувати"}</button>
                    <button type="button" className="client-save-button" onClick={() => void saveClientInformation()} disabled={savingClientInfo}>{savingClientInfo ? (language === "en" ? "Saving…" : "Збереження…") : (language === "en" ? "Save" : "Зберегти")}</button>
                  </div>
                </>
              )}
            </section>

            <form className="client-details-form" onSubmit={saveDetails}>
              <label className="client-detail-label"><span><FaStickyNote />{language === "en" ? "Client notes" : "Нотатки про клієнта"}</span>
                <textarea rows={5} maxLength={5000} value={notes} onChange={(event) => setNotes(event.target.value)} placeholder={language === "en" ? "Add useful context about this client…" : "Додайте важливу інформацію про клієнта…"} />
              </label>
              <label className="client-detail-label"><span><FaPercent />{language === "en" ? "Discount, %" : "Знижка, %"}</span>
                <input type="number" min="0" max="100" step="1" value={discount} onChange={(event) => setDiscount(event.target.value)} placeholder="0–100" />
                <small>{language === "en" ? "Saved as a client note; it is not applied to orders automatically." : "Зберігається у картці клієнта й автоматично не застосовується до замовлень."}</small>
              </label>
              <button className="client-save-button" type="submit" disabled={saving}>{saving ? (language === "en" ? "Saving…" : "Збереження…") : (language === "en" ? "Save changes" : "Зберегти зміни")}</button>
            </form>

            <div className="client-related-leads">
              <h3>{language === "en" ? "Recent leads" : "Останні заявки"}</h3>
              {selectedClient.leads.length ? selectedClient.leads.map((lead) => (
                <Link key={lead.id} href={`/dashboard/lead/${lead.id}`} className="client-related-lead">
                  <span><strong>{lead.website.websiteName}</strong><small>{dateLabel(lead.createdAt)}</small></span><span aria-hidden="true">→</span>
                </Link>
              )) : <p className="clients-empty">{language === "en" ? "No leads are linked to this client." : "До цього клієнта ще не прив’язано заявок."}</p>}
            </div>
          </section>
        ) : (
          <section className="client-detail-empty"><FaUsers /><h2>{language === "en" ? "Your clients" : "Ваші клієнти"}</h2><p>{language === "en" ? "Create a client from a lead to keep their requests together." : "Створіть клієнта із заявки, щоб зібрати його звернення в одному місці."}</p></section>
        )}
      </div>
    </main>
  );
}
