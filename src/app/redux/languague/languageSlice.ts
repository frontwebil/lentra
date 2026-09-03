import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = "uk" | "en";

interface LanguageState {
  language: Language;
}

const getInitialLanguage = (): Language => {
  const savedLanguage = localStorage.getItem("language");

  if (!savedLanguage) {
    return "en";
  }

  return savedLanguage === "en" ? "en" : "uk";
};

const initialState: LanguageState = {
  language: getInitialLanguage(),
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
