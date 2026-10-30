import { redis } from "@/lib/rate-limit";

export async function notifyUserAboutNewLead({
  userId,
  language,
  websiteName,
  fields,
  schema,
}: {
  userId: string;
  language: "uk" | "en";
  websiteName: string;
  fields: Record<string, unknown>;
  schema: { key: string; label: string }[];
}) {
  try {
    const chatId = await redis.get<string>(`telegram:chat:${userId}`);
    const botToken = process.env.TELEGRAM_BOT_API_KEY;
    if (!chatId || !botToken) return;

    const lines = schema
      .filter((field) => fields[field.key] !== undefined && fields[field.key] !== "")
      .slice(0, 8)
      .map((field) => `${field.label}: ${String(fields[field.key]).slice(0, 180)}`);
    const text = [
      language === "en" ? "🔔 New lead" : "🔔 Нова заявка",
      `${language === "en" ? "Website" : "Сайт"}: ${websiteName}`,
      ...lines,
    ].join("\n");

    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 4000) }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Could not send Telegram lead notification:", await response.text());
    }
  } catch (error) {
    console.error("Telegram lead notification error:", error);
  }
}
