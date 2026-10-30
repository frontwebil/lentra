"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { RxBell, RxCheck, RxGlobe, RxGear, RxLink2 } from "react-icons/rx";
import { setLanguage } from "@/app/redux/languague/languageSlice";
import "./style.css";

type Language = "uk" | "en";

export function Settings() {
  const { update } = useSession();
  const dispatch = useDispatch();
  const [companyName, setCompanyName] = useState("");
  const [language, setSelectedLanguage] = useState<Language>("uk");
  const [saving, setSaving] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [connectingTelegram, setConnectingTelegram] = useState(false);
  const [telegramConnected, setTelegramConnected] = useState(false);
  const isEnglish = language === "en";

  useEffect(() => {
    axios.get<{ user: { companyName: string; language: Language } }>("/api/crm/settings")
      .then(({ data }) => {
        setCompanyName(data.user.companyName);
        setSelectedLanguage(data.user.language);
      })
      .catch(() => {
        toast.error("Could not load CRM settings.");
      })
      .finally(() => setLoadingProfile(false));
  }, []);

  useEffect(() => {
    const refreshTelegramStatus = () => {
      axios
        .get<{ connected: boolean }>("/api/crm/telegram/connect")
        .then(({ data }) => setTelegramConnected(data.connected))
        .catch(() => setTelegramConnected(false));
    };

    refreshTelegramStatus();
    window.addEventListener("focus", refreshTelegramStatus);
    return () => window.removeEventListener("focus", refreshTelegramStatus);
  }, []);

  const saveSettings = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (saving || loadingProfile) return;

    setSaving(true);
    try {
      await axios.patch("/api/crm/settings", { companyName, language });
      localStorage.setItem("language", language);
      dispatch(setLanguage(language));
      await update();
      toast.success(isEnglish ? "Settings saved" : "Налаштування збережено");
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.message
        : null;
      toast.error(
        message ||
          (isEnglish
            ? "Could not save settings. Please try again."
            : "Не вдалося зберегти налаштування. Спробуйте ще раз."),
      );
    } finally {
      setSaving(false);
    }
  };

  const connectTelegram = async () => {
    if (connectingTelegram) return;
    setConnectingTelegram(true);
    try {
      const { data } = await axios.post<{ url: string }>(
        "/api/crm/telegram/connect",
      );
      window.location.assign(data.url);
    } catch (error) {
      const isWebhookConflict =
        axios.isAxiosError(error) && error.response?.status === 409;
      const errorCode = axios.isAxiosError(error)
        ? error.response?.data?.code
        : null;
      const messages: Record<string, [string, string]> = {
        TELEGRAM_BOT_TOKEN_MISSING: [
          "Set TELEGRAM_BOT_API_KEY in the server environment first.",
          "Спочатку додайте TELEGRAM_BOT_API_KEY у змінні середовища сервера.",
        ],
        TELEGRAM_APP_URL_MISSING: [
          "Set NEXT_PUBLIC_APP_URL to your public CRM address.",
          "Вкажіть публічну адресу CRM у NEXT_PUBLIC_APP_URL.",
        ],
        TELEGRAM_HTTPS_REQUIRED: [
          "Telegram needs a public HTTPS address. localhost cannot receive bot updates.",
          "Telegram потребує публічну HTTPS-адресу. localhost не може отримувати оновлення від бота.",
        ],
        TELEGRAM_BOT_INVALID: [
          "Telegram rejected the bot token. Check TELEGRAM_BOT_API_KEY.",
          "Telegram не прийняв токен бота. Перевірте TELEGRAM_BOT_API_KEY.",
        ],
        TELEGRAM_WEBHOOK_CONFLICT: [
          "This bot already uses another webhook. It was left unchanged.",
          "Цей бот уже використовує інший webhook. Його не змінювали.",
        ],
        TELEGRAM_WEBHOOK_SETUP_FAILED: [
          "Telegram could not set the webhook. Check the public URL and bot settings.",
          "Telegram не зміг налаштувати webhook. Перевірте публічну адресу й налаштування бота.",
        ],
      };
      const localizedMessage =
        typeof errorCode === "string" ? messages[errorCode]?.[isEnglish ? 0 : 1] : null;

      toast.error(
        localizedMessage ||
          (isWebhookConflict
            ? isEnglish
              ? "This Telegram bot already uses another webhook."
              : "Цей Telegram-бот уже використовує інший webhook."
            : isEnglish
              ? "Could not start Telegram connection. Check the bot configuration and try again."
              : "Не вдалося почати підключення Telegram. Перевірте налаштування бота й спробуйте ще раз."),
      );
    } finally {
      setConnectingTelegram(false);
    }
  };

  const disconnectTelegram = async () => {
    try {
      await axios.delete("/api/crm/telegram/connect");
      setTelegramConnected(false);
      toast.success(isEnglish ? "Telegram disconnected" : "Telegram відключено");
    } catch {
      toast.error(isEnglish ? "Could not disconnect Telegram" : "Не вдалося відключити Telegram");
    }
  };

  return (
    <main className="dashboard-page crm-settings-page">
      <header className="crm-settings-heading">
        <div className="crm-settings-heading-icon"><RxGear /></div>
        <div>
          <h1 className="dashboard-page-title dashboard-semibold">
            {isEnglish ? "Settings" : "Налаштування"}
          </h1>
          <p className="dashboard-page-description">
            {isEnglish
              ? "Manage your company profile, CRM language, and notifications."
              : "Керуйте назвою компанії, мовою CRM та сповіщеннями."}
          </p>
        </div>
      </header>

      <section className="crm-settings-card">
        <div className="crm-settings-card-heading">
          <div className="crm-settings-heading-icon"><RxGlobe /></div>
          <div>
            <h2>{isEnglish ? "Company and language" : "Компанія та мова"}</h2>
            <p>{isEnglish ? "These preferences apply to your CRM account." : "Ці налаштування застосовуються до вашого CRM-акаунта."}</p>
          </div>
        </div>

        <form className="crm-settings-form" onSubmit={saveSettings}>
          <label className="crm-settings-field">
            <span>{isEnglish ? "Company name" : "Назва компанії"}</span>
            <input
              autoComplete="organization"
              maxLength={100}
              minLength={2}
              onChange={(event) => setCompanyName(event.target.value)}
              required
              disabled={loadingProfile}
              value={companyName}
            />
          </label>

          <label className="crm-settings-field">
            <span>{isEnglish ? "CRM language" : "Мова CRM"}</span>
            <select
              onChange={(event) => setSelectedLanguage(event.target.value as Language)}
              disabled={loadingProfile}
              value={language}
            >
              <option value="uk">Українська</option>
              <option value="en">English</option>
            </select>
          </label>

          <div className="crm-settings-language-note" role="note">
            <RxBell aria-hidden="true" />
            <p>
              {isEnglish
                ? "Changing the language updates the CRM interface and new system messages. Existing lead logs and saved status names stay in the language they were written in."
                : "Зміна мови оновить інтерфейс CRM і нові системні повідомлення. Старі логи та збережені назви статусів залишаться мовою, якою їх створили."}
            </p>
          </div>

          <button className="dashboard-primary-button dashboard-primary-button-standard crm-settings-save" disabled={saving || loadingProfile} type="submit">
            {saving
              ? isEnglish ? "Saving…" : "Зберігаємо…"
              : isEnglish ? "Save changes" : "Зберегти зміни"}
          </button>
        </form>
      </section>

      <section className="crm-settings-card">
        <div className="crm-settings-card-heading">
          <div className="crm-settings-heading-icon"><RxLink2 /></div>
          <div>
            <h2>{isEnglish ? "Telegram notifications" : "Сповіщення в Telegram"}</h2>
            <p>{isEnglish ? "Get a Telegram message when a new lead arrives." : "Отримуйте повідомлення в Telegram, коли надходить нова заявка."}</p>
          </div>
        </div>

        <div className="crm-settings-telegram-row">
          <div className="crm-settings-telegram-status">
            <span className={`crm-settings-status-dot${telegramConnected ? " connected" : ""}`} />
            <span>
              {telegramConnected
                ? isEnglish ? "Telegram connected" : "Telegram підключено"
                : isEnglish ? "Telegram is not connected" : "Telegram ще не підключено"}
            </span>
          </div>
          {telegramConnected ? (
            <button className="crm-settings-secondary-button" onClick={disconnectTelegram} type="button">
              {isEnglish ? "Disconnect" : "Відключити"}
            </button>
          ) : (
            <button className="dashboard-primary-button dashboard-primary-button-standard" disabled={connectingTelegram} onClick={connectTelegram} type="button">
              <RxLink2 />
              {connectingTelegram
                ? isEnglish ? "Connecting…" : "Підключаємо…"
                : isEnglish ? "Connect Telegram" : "Підключити Telegram"}
            </button>
          )}
        </div>
        {telegramConnected && (
          <p className="crm-settings-connected-note"><RxCheck /> {isEnglish ? "New lead notifications are enabled." : "Сповіщення про нові заявки увімкнено."}</p>
        )}
      </section>
    </main>
  );
}
