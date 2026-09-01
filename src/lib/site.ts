// Централізована конфігурація сайту для SEO.
// За потреби можна перевизначити через NEXT_PUBLIC_SITE_URL у змінних середовища.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.lentra.tech";

export const SITE_NAME = "Lentra";

export const SITE_TITLE = "Lentra - CRM для заявок з сайту";

export const SITE_DESCRIPTION =
  "Lentra - CRM для заявок: приймайте звернення з ваших сайтів через API, керуйте клієнтами, статусами та нотатками в одному місці. Підключення за кілька хвилин.";

export const SITE_TITLE_EN = "Lentra - CRM for website leads";

export const SITE_DESCRIPTION_EN =
  "Lentra is a CRM for leads: collect inquiries from your websites through an API and manage clients, statuses, and notes in one place. Setup takes just a few minutes.";
