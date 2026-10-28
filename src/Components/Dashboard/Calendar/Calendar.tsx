"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { RxChevronLeft, RxChevronRight, RxChevronDown, RxCalendar } from "react-icons/rx";
import { normalizeLeadStatus } from "../Leeds/LeedsPage/LeedsPage";
import "./style.css";

type SchemaField = { key: string; type: string; label?: string };
type CardField = { key: string; label: string };
type Website = { id: string; websiteName: string; websiteUrl: string; leadSchema: unknown; leads: Lead[] };
type Lead = { id: string; fields: unknown; status: unknown; createdAt: string; updatedAt: string };
type Event = { lead: Lead; website: Website; date: Date; name: string; service: string; status: ReturnType<typeof normalizeLeadStatus> };

const dayMs = 86400000;
const colors = ["#d9fbe9", "#f4dcff", "#ffe8b2", "#ffd9df", "#d9efff"];

function startOfDay(date: Date) { const d = new Date(date); d.setHours(0, 0, 0, 0); return d; }
function dateKey(date: Date) { return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`; }
function parseBookingDate(fields: Record<string, unknown>, schema: SchemaField[]) {
  const dateField = schema.find((field) => field.type === "date");
  const timeField = schema.find((field) => field.type === "time");
  if (!dateField || !timeField || !fields[dateField.key]) return null;
  const dateValue = String(fields[dateField.key]);
  const timeValue = String(fields[timeField.key] ?? "00:00");
  const date = new Date(`${dateValue}T${timeValue.length === 5 ? `${timeValue}:00` : timeValue}`);
  return Number.isNaN(date.getTime()) ? null : date;
}
function mondayOf(date: Date) { const d = startOfDay(date); const offset = (d.getDay() + 6) % 7; return new Date(d.getTime() - offset * dayMs); }

export function Calendar() {
  const { data: session } = useSession();
  const language = session?.user.language === "en" ? "en" : "uk";
  const [websites, setWebsites] = useState<Website[]>([]);
  const [selectedSites, setSelectedSites] = useState<string[]>([]);
  const [date, setDate] = useState(() => new Date());
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [siteMenu, setSiteMenu] = useState(false);
  const [cardBuilderOpen, setCardBuilderOpen] = useState(false);
  const [selectedCardFields, setSelectedCardFields] = useState<string[]>([]);

  useEffect(() => {
    const savedFields = window.localStorage.getItem("calendar_card_fields");
    if (savedFields) setSelectedCardFields(JSON.parse(savedFields));
    axios.get("/api/crm/calendar").then(({ data }) => {
      setWebsites(data.websites);
      setSelectedSites(data.websites.map((site: Website) => site.id));
    });
  }, []);

  const availableCardFields = useMemo<CardField[]>(() => {
    const fields = new Map<string, CardField>();
    websites.filter((site) => selectedSites.includes(site.id)).forEach((site) => {
      const schema = Array.isArray(site.leadSchema) ? site.leadSchema as SchemaField[] : [];
      schema.forEach((field) => fields.set(field.key, { key: field.key, label: field.label || field.key }));
    });
    return Array.from(fields.values());
  }, [websites, selectedSites]);

  const toggleCardField = (key: string) => {
    setSelectedCardFields((current) => {
      const next = current.includes(key) ? current.filter((field) => field !== key) : [...current, key];
      window.localStorage.setItem("calendar_card_fields", JSON.stringify(next));
      return next;
    });
  };

  const events = useMemo<Event[]>(() => websites.flatMap((website) => {
    if (!selectedSites.includes(website.id)) return [];
    const schema = Array.isArray(website.leadSchema) ? website.leadSchema as SchemaField[] : [];
    return website.leads.flatMap((lead) => {
      const fields = (lead.fields ?? {}) as Record<string, unknown>;
      const bookingDate = parseBookingDate(fields, schema);
      if (!bookingDate) return [];
      const text = (key: string) => String(fields[key] ?? "");
      const nameKey = schema.find((field) => /name|ім.?я/i.test(field.key) || /name|ім.?я/i.test(field.label ?? ""))?.key;
      const serviceKey = schema.find((field) => /service|category|послуг|категор/i.test(field.key) || /service|category|послуг|категор/i.test(field.label ?? ""))?.key;
      return [{ lead, website, date: bookingDate, name: text(nameKey ?? "name") || (language === "en" ? "Booking" : "Запис"), service: text(serviceKey ?? "service"), status: normalizeLeadStatus(lead.status, language) }];
    });
  }), [websites, selectedSites, language]);

  const weekStart = mondayOf(date);
  const days = Array.from({ length: 7 }, (_, i) => new Date(weekStart.getTime() + i * dayMs));
  const visibleDays = view === "day" ? [startOfDay(date)] : days;
  const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
  const monthGridStart = mondayOf(monthStart);
  const monthDays = Array.from({ length: 42 }, (_, i) => new Date(monthGridStart.getTime() + i * dayMs));
  const periodLabel = view === "month" ? date.toLocaleDateString(language === "en" ? "en-GB" : "uk-UA", { month: "long", year: "numeric" }) : `${visibleDays[0].toLocaleDateString(language === "en" ? "en-GB" : "uk-UA", { day: "numeric", month: "short" })} – ${visibleDays[visibleDays.length - 1].toLocaleDateString(language === "en" ? "en-GB" : "uk-UA", { day: "numeric", month: "short", year: "numeric" })}`;
  const move = (amount: number) => setDate((current) => new Date(current.getTime() + (view === "month" ? amount * 30 * dayMs : amount * (view === "day" ? dayMs : 7 * dayMs))));
  const eventFor = (day: Date) => events.filter((event) => dateKey(event.date) === dateKey(day));
  const siteLabel = selectedSites.length === websites.length ? (language === "en" ? "All websites" : "Усі сайти") : selectedSites.length ? `${selectedSites.length} ${language === "en" ? "websites" : "сайтів"}` : (language === "en" ? "No websites" : "Немає сайтів");
  const hours = Array.from({ length: 13 }, (_, index) => index + 8);
  const eventsForHour = (day: Date, hour: number) => eventFor(day).filter((event) => event.date.getHours() === hour);
  const cardHeight = (event: Event) => {
    const fields = event.lead.fields as Record<string, unknown> | null;
    const visibleValues = selectedCardFields.filter((key) => key !== "name" && fields?.[key]);
    return Math.max(72, 62 + visibleValues.length * 20);
  };
  const rowHeight = (hour: number) => {
    const maxHeight = Math.max(0, ...visibleDays.map((day) => {
      const dayEvents = eventsForHour(day, hour);
      return dayEvents.length
        ? dayEvents.reduce((total, event) => total + cardHeight(event), 0) + (dayEvents.length - 1) * 5 + 10
        : 0;
    }));
    return Math.max(69, maxHeight);
  };

  return <div className="dashboard-page calendar-page">
    <div className="calendar-heading"><div><h1 className="dashboard-page-title dashboard-semibold">{language === "en" ? "Calendar" : "Календар"}</h1><p className="dashboard-page-description">{language === "en" ? "Appointments from your websites" : "Записи з ваших сайтів"}</p></div><div className="calendar-heading-actions"><div className="calendar-site-filter"><button className="calendar-filter-button" onClick={() => setSiteMenu(!siteMenu)}><RxCalendar /> {siteLabel} <RxChevronDown /></button>{siteMenu && <div className="calendar-site-menu">{websites.map((site) => <label key={site.id}><input type="checkbox" checked={selectedSites.includes(site.id)} onChange={() => setSelectedSites((current) => current.includes(site.id) ? current.filter((id) => id !== site.id) : [...current, site.id])} /> <span>{site.websiteName}</span></label>)}</div>}</div><div className="calendar-card-builder"><button className="calendar-filter-button" onClick={() => setCardBuilderOpen(!cardBuilderOpen)}>{language === "en" ? "Card fields" : "Поля картки"} <RxChevronDown /></button>{cardBuilderOpen && <div className="calendar-card-menu"><strong>{language === "en" ? "Show on cards" : "Показувати на картках"}</strong><span>{language === "en" ? "Choose fields from your website forms" : "Оберіть поля з форм ваших сайтів"}</span>{availableCardFields.map((field) => <label key={field.key}><input type="checkbox" checked={selectedCardFields.includes(field.key)} onChange={() => toggleCardField(field.key)} /> <span>{field.label}</span></label>)}{!availableCardFields.length && <em>{language === "en" ? "Select a website first" : "Спочатку оберіть сайт"}</em>}</div>}</div></div></div>
    <div className="calendar-toolbar"><button className="calendar-today" onClick={() => setDate(new Date())}>{language === "en" ? "Today" : "Сьогодні"}</button><button className="calendar-arrow" onClick={() => move(-1)}><RxChevronLeft /></button><button className="calendar-arrow" onClick={() => move(1)}><RxChevronRight /></button><strong>{periodLabel}</strong><div className="calendar-views">{(["day", "week", "month"] as const).map((item) => <button key={item} className={view === item ? "selected" : ""} onClick={() => setView(item)}>{language === "en" ? item[0].toUpperCase() + item.slice(1) : item === "day" ? "День" : item === "week" ? "Тиждень" : "Місяць"}</button>)}</div></div>
    {view === "month" ? <div className="calendar-month"><div className="month-weekdays">{(language === "en" ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] : ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Нд"]).map((item) => <span key={item}>{item}</span>)}</div><div className="month-grid">{monthDays.map((day) => <div className={`month-cell ${day.getMonth() !== date.getMonth() ? "muted" : ""}`} key={dateKey(day)}><b>{day.getDate()}</b>{eventFor(day).slice(0, 3).map((event, index) => <Link href={`/dashboard/lead/${event.lead.id}`} className="month-event" style={{ background: colors[index % colors.length] }} key={event.lead.id}>{event.name}</Link>)}</div>)}</div></div> : <div className="calendar-week"><div className="calendar-time-column">{hours.map((hour) => <span key={hour} style={{ height: rowHeight(hour) }}>{String(hour).padStart(2, "0")}:00</span>)}</div>{visibleDays.map((day) => <div className="calendar-day" key={dateKey(day)}><div className={`calendar-day-header ${dateKey(day) === dateKey(new Date()) ? "today" : ""}`}><b>{day.toLocaleDateString(language === "en" ? "en-GB" : "uk-UA", { weekday: "short" }).toUpperCase()}</b><strong>{day.getDate()}</strong><small>{eventFor(day).length} {language === "en" ? "appointments" : "записів"}</small></div><div className="calendar-day-body">{hours.map((hour) => <div className="calendar-hour-row" style={{ height: rowHeight(hour) }} key={hour}>{eventsForHour(day, hour).map((event, index) => <Link href={`/dashboard/lead/${event.lead.id}`} className="calendar-event" style={{ background: colors[index % colors.length], borderLeftColor: colors[(index + 2) % colors.length] }} key={event.lead.id}><b>{event.date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} {event.name}</b>{selectedCardFields.filter((key) => key !== "name").map((key) => { const value = String((event.lead.fields as Record<string, unknown> | null)?.[key] ?? ""); return value ? <span key={key}>{availableCardFields.find((field) => field.key === key)?.label}: {value}</span> : null; })}<small>{event.website.websiteName} · {event.status.text}</small></Link>)}</div>)}</div></div>)}</div>}
  </div>;
}
