import { Header } from "@/Components/LandingPage/Header/Header";
import { Hero } from "@/Components/LandingPage/Hero/Hero";
import { HowItWorks } from "@/Components/LandingPage/HowItWorks/HowItWorks";
import { InOnePlace } from "@/Components/LandingPage/InOnePlace/InOnePlace";
import { OneApiForAll } from "@/Components/LandingPage/OneApiForAll/OneApiForAll";
import { Possibility } from "@/Components/LandingPage/Possibility/Possibility";
import { ForAnyBusiness } from "@/Components/LandingPage/ForAnyBusiness/ForAnyBusiness";
import { Faq } from "@/Components/LandingPage/Faq/Faq";
import { Consultation } from "@/Components/LandingPage/Consultation/Consultation";
import { Footer } from "@/Components/LandingPage/Footer/Footer";
import type { Dictionary } from "@/dictionaries/uk";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = {
  dict: Dictionary;
  locale: "uk" | "en";
  description: string;
};

export function Landing({ dict, locale, description }: Props) {
  const pageUrl = locale === "en" ? `${SITE_URL}/en` : SITE_URL;

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: SITE_NAME,
      description,
      url: pageUrl,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "UAH",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: dict.faq.questions.map((q) => ({
        "@type": "Question",
        name: q.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: q.answer,
        },
      })),
    },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header dict={dict.header} locale={locale} />
      <Hero dict={dict.hero} />
      <InOnePlace dict={dict.inOnePlace} />
      <HowItWorks dict={dict.howItWorks} />
      <Possibility dict={dict.possibility} />
      <OneApiForAll dict={dict.oneApiForAll} />
      <ForAnyBusiness dict={dict.forAnyBusiness} />
      <Faq dict={dict.faq} />
      <Consultation dict={dict.consultation} />
      <Footer dict={dict.footer} locale={locale} />
    </div>
  );
}
