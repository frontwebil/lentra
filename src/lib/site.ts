// Централізована конфігурація сайту для SEO.
// ВАЖЛИВО: задай NEXT_PUBLIC_SITE_URL у змінних середовища (Vercel → Settings →
// Environment Variables), наприклад: https://lentra.com.ua
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const SITE_NAME = "Lentra";

export const SITE_TITLE = "Lentra — CRM для заявок з сайту";

export const SITE_DESCRIPTION =
  "Lentra — CRM для заявок: приймайте звернення з ваших сайтів через API, керуйте клієнтами, статусами та нотатками в одному місці. Підключення за кілька хвилин.";
