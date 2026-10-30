import { authOptions } from "@/lib/auth";
import { redis } from "@/lib/rate-limit";
import { getServerSession } from "next-auth";
import { createHash, randomBytes } from "crypto";
import { NextResponse } from "next/server";

const connectedChatKey = (userId: string) => `telegram:chat:${userId}`;
const connectTokenKey = (token: string) => `telegram:connect:${token}`;

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const chatId = await redis.get<string>(connectedChatKey(session.user.id));
  return NextResponse.json({ connected: Boolean(chatId) });
}

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const botToken = process.env.TELEGRAM_BOT_API_KEY;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/+$/, "");
  if (!botToken) {
    return NextResponse.json(
      { code: "TELEGRAM_BOT_TOKEN_MISSING" },
      { status: 503 },
    );
  }
  if (!appUrl) {
    return NextResponse.json(
      { code: "TELEGRAM_APP_URL_MISSING" },
      { status: 503 },
    );
  }

  try {
    const appOrigin = new URL(appUrl);
    if (appOrigin.protocol !== "https:") {
      return NextResponse.json(
        { code: "TELEGRAM_HTTPS_REQUIRED" },
        { status: 503 },
      );
    }

    const botApiUrl = `https://api.telegram.org/bot${botToken}`;
    const [botResponse, webhookResponse] = await Promise.all([
      fetch(`${botApiUrl}/getMe`, { cache: "no-store" }),
      fetch(`${botApiUrl}/getWebhookInfo`, { cache: "no-store" }),
    ]);
    const botResult = await botResponse.json();
    const webhookResult = await webhookResponse.json();
    if (!botResponse.ok || !botResult.ok || !botResult.result?.username) {
      return NextResponse.json(
        { code: "TELEGRAM_BOT_INVALID" },
        { status: 502 },
      );
    }

    const webhookUrl = `${appUrl}/api/Telegram/webhook`;
    const currentWebhookUrl = webhookResult.result?.url;
    if (currentWebhookUrl && currentWebhookUrl !== webhookUrl) {
      return NextResponse.json(
        { code: "TELEGRAM_WEBHOOK_CONFLICT" },
        { status: 409 },
      );
    }

    const webhookSecret = createHash("sha256").update(`${botToken}:${appUrl}`).digest("base64url");
    const setWebhookResponse = await fetch(`${botApiUrl}/setWebhook`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl, secret_token: webhookSecret, allowed_updates: ["message"] }),
      cache: "no-store",
    });
    const setWebhookResult = await setWebhookResponse.json();
    if (!setWebhookResponse.ok || !setWebhookResult.ok) {
      return NextResponse.json(
        { code: "TELEGRAM_WEBHOOK_SETUP_FAILED" },
        { status: 502 },
      );
    }

    const token = randomBytes(24).toString("hex");
    await redis.set(
      connectTokenKey(token),
      { userId: session.user.id, language: session.user.language },
      { ex: 600 },
    );
    return NextResponse.json({ url: `https://t.me/${botResult.result.username}?start=${token}` });
  } catch (error) {
    console.error("Start Telegram connection error:", error);
    return NextResponse.json({ message: "Could not start Telegram connection" }, { status: 502 });
  }
}

export async function DELETE() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  await redis.del(connectedChatKey(session.user.id));
  return NextResponse.json({ success: true });
}
