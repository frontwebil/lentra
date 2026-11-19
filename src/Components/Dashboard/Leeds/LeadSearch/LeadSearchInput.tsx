"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { RxCross2, RxMagnifyingGlass } from "react-icons/rx";
import { LEAD_SEARCH_MAX_LENGTH } from "@/lib/lead-search-constants";
import "./style.css";

const DEBOUNCE_MS = 350;

type Props = {
  language: string;
  placeholder?: string;
};

/**
 * Debounced search box synced with `?q=` in the URL. Filtering happens on the
 * server (the page re-renders with the new search params); changing the query
 * also resets `?page=`.
 */
export function LeadSearchInput({ language, placeholder }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = searchParams.get("q") ?? "";

  const [value, setValue] = useState(urlQuery);
  const [sentQuery, setSentQuery] = useState(urlQuery);
  const [prevUrlQuery, setPrevUrlQuery] = useState(urlQuery);
  const [isPending, startTransition] = useTransition();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // URL changed from outside (back/forward, a link): reflect it in the input,
  // unless it is just the echo of what we sent ourselves.
  if (urlQuery !== prevUrlQuery) {
    setPrevUrlQuery(urlQuery);
    if (urlQuery !== sentQuery) {
      setValue(urlQuery);
      setSentQuery(urlQuery);
    }
  }

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const pushQuery = (next: string) => {
    const trimmed = next.trim();
    setSentQuery(trimmed);
    const params = new URLSearchParams(searchParams.toString());
    if (trimmed) params.set("q", trimmed);
    else params.delete("q");
    params.delete("page");
    const qs = params.toString();
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    });
  };

  const handleChange = (next: string) => {
    setValue(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (next.trim() !== urlQuery) pushQuery(next);
    }, DEBOUNCE_MS);
  };

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    setValue("");
    if (urlQuery) pushQuery("");
  };

  const label = language === "en" ? "Search leads" : "Пошук заявок";

  return (
    <div className={`lead-search ${isPending ? "is-pending" : ""}`} role="search">
      <RxMagnifyingGlass className="lead-search-icon" aria-hidden="true" />
      <input
        type="search"
        className="lead-search-input"
        value={value}
        maxLength={LEAD_SEARCH_MAX_LENGTH}
        onChange={(event) => handleChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            if (timer.current) clearTimeout(timer.current);
            pushQuery(value);
          }
          if (event.key === "Escape") clear();
        }}
        placeholder={
          placeholder ??
          (language === "en"
            ? "Name, phone, e-mail or any field…"
            : "Ім’я, телефон, e-mail або будь-яке поле…")
        }
        aria-label={label}
      />
      {isPending ? (
        <span className="lead-search-spinner" aria-label={language === "en" ? "Searching" : "Пошук"} />
      ) : (
        value && (
          <button
            type="button"
            className="lead-search-clear"
            onClick={clear}
            aria-label={language === "en" ? "Clear search" : "Очистити пошук"}
          >
            <RxCross2 />
          </button>
        )
      )}
    </div>
  );
}

export function ClientDiscountBadge({
  percent,
  language,
  compact = false,
}: {
  percent: number | null | undefined;
  language: string;
  compact?: boolean;
}) {
  if (percent === null || percent === undefined || !(percent > 0)) return null;
  const value = Number.isInteger(percent) ? percent : Number(percent.toFixed(2));
  const text = compact
    ? `−${value} %`
    : language === "en"
      ? `Discount ${value} %`
      : `Знижка ${value} %`;
  return (
    <span
      className={`client-discount-badge ${compact ? "compact" : ""}`}
      title={
        language === "en"
          ? `Client's personal discount: ${value} %`
          : `Персональна знижка клієнта: ${value} %`
      }
    >
      {text}
    </span>
  );
}
