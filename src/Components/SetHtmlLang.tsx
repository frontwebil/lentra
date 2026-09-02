"use client";

import { Language } from "@/app/redux/languague/languageSlice";
import { useEffect } from "react";

export function SetHtmlLang({ lang }: { lang: Language }) {
  useEffect(() => {
    document.documentElement.lang = lang;
    return () => {
      document.documentElement.lang = "uk";
    };
  }, [lang]);

  return null;
}
