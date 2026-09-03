import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const request = req.json();
  console.log(request);
  try {
    const { name, phone, email, site, message } = await req.json();

    if (!name || !phone) {
      return NextResponse.json({ message: "Некоректні дані" }, { status: 400 });
    }

    const text = `
📩 Нова заявка на консультацію

👤 Ім'я: ${name}
📞 Телефон: ${phone}
📧 Email: ${email || "Не вказано"}
🌐 Сайт: ${site || "Не вказано"}
💬 Коментар: ${message || "Нічого не вказано"}
`;

    const tgResponse = await fetch(
      `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_API_KEY}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text,
        }),
      },
    );

    if (!tgResponse.ok) {
      const errBody = await tgResponse.json();
      console.error("Telegram error:", errBody);
      throw new Error(`Telegram API: ${errBody.description}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Не вдалося відправити заявку" },
      { status: 500 },
    );
  }
}
