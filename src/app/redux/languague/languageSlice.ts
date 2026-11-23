import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = "uk" | "en";

interface LanguageState {
  language: Language;
}

// Must match on server and client for hydration; the saved language is
// applied after mount by StoreProvider via readSavedLanguage().
const initialState: LanguageState = {
  language: "en",
};

export const readSavedLanguage = (): Language | null => {
  try {
    const savedLanguage = localStorage.getItem("language");
    if (!savedLanguage) return null;
    return savedLanguage === "en" ? "en" : "uk";
  } catch {
    return null;
  }
};

const languageSlice = createSlice({
  name: "language",
  initialState,
  reducers: {
    setLanguage: (state, action: PayloadAction<Language>) => {
      state.language = action.payload;
    },
  },
});

export const { setLanguage } = languageSlice.actions;
export default languageSlice.reducer;
