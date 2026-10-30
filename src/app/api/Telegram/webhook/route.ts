import { redis } from "@/lib/rate-limit";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

type TelegramUpdate = {
  message?: { text?: string; chat?: { id?: number | string } };
};

type ConnectPayload = { userId: string; language: "uk" | "en" };

export async function POST(req: Request) {
  const botToken = process.env.TELEGRAM_BOT_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  if (!botToken || !appUrl) return NextResponse.json({ ok: false }, { status: 503 });

  const expectedSecret = createHash("sha256").update(`${botToken}:${appUrl}`).digest("base64url");
  if (req.headers.get("x-telegram-bot-api-secret-token") !== expectedSecret) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  try {
    const update = (await req.json()) as TelegramUpdate;
    const message = update.message;
    const chatId = message?.chat?.id;
    const startMatch = message?.text?.match(/^\/start(?:@\w+)?\s+([a-f\d]{48})\s*$/i);
    if (!chatId || !startMatch) return NextResponse.json({ ok: true });

    const token = startMatch[1];
    const tokenKey = `telegram:connect:${token}`;
    const connection = await redis.get<ConnectPayload>(tokenKey);
    if (!connection?.userId) {
      await sendTelegramMessage(
        botToken,
        chatId,
        "This connection link has expired. Start the connection again from your CRM settings.",
      );
      return NextResponse.json({ ok: true });
    }

    await redis.set(`telegram:chat:${connection.userId}`, String(chatId));
    await redis.del(tokenKey);
    await sendTelegramMessage(
      botToken,
      chatId,
      connection.language === "en"
        ? "Telegram notifications are connected. You will receive a message when a new lead arrives."
        : "Сповіщення в Telegram підключено. Ви отримуватимете повідомлення про нові заявки.",
    );
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telegram webhook error:", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function sendTelegramMessage(botToken: string, chatId: number | string, text: string) {
  await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
    cache: "no-store",
  });
}
