import type { Metadata } from "next";

import { Dela_Gothic_One, Unbounded, Montserrat } from "next/font/google";

import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

import "./globals.css";
import "./reset.css";

const delaGothic = Dela_Gothic_One({
  variable: "--font-dela-gothic",
  subsets: ["latin"],
  weight: "400",
});

const unbounded = Unbounded({
  variable: "--font-unbounded",
  subsets: ["latin", "cyrillic"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "CRM",
    "CRM для заявок",
    "заявки з сайту",
    "облік клієнтів",
    "CRM Україна",
    "Lentra",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "uk_UA",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: "CB8F3YZKgFS9fRk1VeNQQFsZRGGaAMMuzD4qSQIo5_s",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="uk"
      className={`${delaGothic.variable} ${unbounded.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
