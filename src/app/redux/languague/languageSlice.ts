import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Language = "uk" | "en";

interface LanguageState {
  language: Language;
}

const initialState: LanguageState = {
  language: "uk",
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
