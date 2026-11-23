"use client";

import { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "../languague/store";
import { readSavedLanguage, setLanguage } from "../languague/languageSlice";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const saved = readSavedLanguage();
    if (saved && saved !== store.getState().language.language) {
      store.dispatch(setLanguage(saved));
    }
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
