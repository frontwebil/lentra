import type { Metadata } from "next";

import { Landing } from "@/Components/LandingPage/Landing";
import { uk } from "@/dictionaries/uk";
import { SITE_DESCRIPTION } from "@/lib/site";

export const metadata: Metadata = {
  alternates: {
    canonical: "/",
    languages: {
      uk: "/",
      en: "/en",
      "x-default": "/",
    },
  },
};

export default function Home() {
  return <Landing dict={uk} locale="uk" description={SITE_DESCRIPTION} />;
}
