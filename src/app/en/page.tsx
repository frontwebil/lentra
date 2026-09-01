import type { Metadata } from "next";

import { Landing } from "@/Components/LandingPage/Landing";
import { SetHtmlLang } from "@/Components/SetHtmlLang";
import { en } from "@/dictionaries/en";
import {
  SITE_DESCRIPTION_EN,
  SITE_NAME,
  SITE_TITLE_EN,
  SITE_URL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: SITE_TITLE_EN },
  description: SITE_DESCRIPTION_EN,
  keywords: [
    "CRM",
    "lead management CRM",
    "website leads",
    "client management",
    "CRM for small business",
    "Lentra",
  ],
  alternates: {
    canonical: "/en",
    languages: {
      uk: "/",
      en: "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/en`,
    siteName: SITE_NAME,
    title: SITE_TITLE_EN,
    description: SITE_DESCRIPTION_EN,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE_EN,
    description: SITE_DESCRIPTION_EN,
  },
};

export default function HomeEn() {
  return (
    <>
      <SetHtmlLang lang="en" />
      <Landing dict={en} locale="en" description={SITE_DESCRIPTION_EN} />
    </>
  );
}
