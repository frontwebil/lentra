import { FaArrowRight, FaCode, FaGlobe, FaKey } from "react-icons/fa";
import type { Dictionary } from "@/dictionaries/uk";
import "./style.css";

type Props = {
  dict: Dictionary["howItWorks"];
};

const stepNumbers = ["01", "02", "03"];
const stepIcons = [<FaGlobe key="website" />, <FaKey key="site-id" />, <FaCode key="api" />];

export function HowItWorks({ dict }: Props) {
  return (
    <section className="HowItWorks" id="how-it-works">
      <div className="container">
        <h2 className="section-title">{dict.title}</h2>
        <p className="how-it-works-subtitle">{dict.subtitle}</p>
        <div className="how-it-works-flow">
          {dict.steps.map((step, i) => (
            <div className="how-it-works-flow-item" key={step.title}>
              <article className="how-it-works-card">
                <div className="how-it-works-card-top">
                  <div className="how-it-works-icon-wrap">{stepIcons[i]}</div>
                  <span className="how-it-works-step-num">{stepNumbers[i]}</span>
                </div>
                <h3 className="how-it-works-title">{step.title}</h3>
                <p className="how-it-works-desc">{step.description}</p>
              </article>
              {i < dict.steps.length - 1 && (
                <FaArrowRight className="how-it-works-flow-arrow" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
