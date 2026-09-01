"use client";

import { useEffect } from "react";

// The root layout renders <html lang="uk"> for the whole app.
// This helper overrides the lang attribute on localized pages (e.g. /en).
export function SetHtmlLang({ lang }: { lang: string }) {
  useEffect(() => {
    document.documentElement.lang = lang;

    return () => {
      document.documentElement.lang = "uk";
    };
  }, [lang]);

  return null;
}
