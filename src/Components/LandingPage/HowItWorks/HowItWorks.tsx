import "./style.css";
import { LuPlug } from "react-icons/lu";
import { LuSend } from "react-icons/lu";
import { LuUsers } from "react-icons/lu";
import type { Dictionary } from "@/dictionaries/uk";



const stepNumbers = ["01", "02", "03"];

const stepIcons = [
  <LuPlug color="#6366f1" key="plug" />,
  <LuSend color="#6366f1" key="send" />,
  <LuUsers color="#6366f1" key="users" />,
];

type Props = {
  dict: Dictionary["howItWorks"];
};

export function HowItWorks({ dict }: Props) {
  return (
    <section className="HowItWorks" id="how-it-works">
      <div className="container">
        <h2 className="section-title">{dict.title}</h2>
        <div className="HowItWorks-instruction">
          <div className="how-it-works-cards">
            {dict.steps.map((step, i) => (
              <div key={i} className="how-it-works-card">
                <div className="how-it-works-card-top">
                  <span className="how-it-works-step-num">
                    {stepNumbers[i]}
                  </span>
                  <div className="how-it-works-icon-wrap">{stepIcons[i]}</div>
                </div>
                <h3 className="how-it-works-title">{step.title}</h3>
                <p className="how-it-works-desc">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
