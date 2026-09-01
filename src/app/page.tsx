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

export default function Home() {
  return (
    <div>
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
