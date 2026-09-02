import { configureStore } from "@reduxjs/toolkit";
import languageReducer from "../languague/languageSlice";

export const store = configureStore({
  reducer: {
    language: languageReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
