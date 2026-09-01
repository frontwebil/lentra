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
import { questions } from "@/Components/LandingPage/Faq/questions";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
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
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  },
];

export default function Home() {
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Header />
      <Hero />
      <InOnePlace />
      <HowItWorks />
      <Possibility />
      <OneApiForAll />
      <ForAnyBusiness />
      <Faq />
      <Consultation />
      <Footer />
    </div>
  );
}
