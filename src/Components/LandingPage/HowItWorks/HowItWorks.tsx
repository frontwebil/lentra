import { FaCode, FaLaptop } from "react-icons/fa";
import "./style.css";
import { LuPlug } from "react-icons/lu";
import { LuSend } from "react-icons/lu";
import { LuUsers } from "react-icons/lu";
import { LuArrowRight } from "react-icons/lu";
import { TbLayoutGrid } from "react-icons/tb";
import { Fragment } from "react/jsx-runtime";

const nodes = [
  {
    icon: <FaLaptop color="#5B55F7" />,
    label: "Ваш сайт",
    accent: false,
  },
  {
    icon: <FaCode color="#5B55F7" />,
    label: "API",
    accent: true,
  },
  {
    icon: <TbLayoutGrid color="#5B55F7" />,
    label: "CRM",
    accent: false,
  },
];

const steps = [
  {
    number: "01",
    icon: <LuPlug color="#6366f1" />,
    title: "Підключіть API",
    description: "Створіть API-ключ та інтегруйте Lentra зі своїм сайтом.",
  },
  {
    number: "02",
    icon: <LuSend color="#6366f1" />,
    title: "Надсилайте заявки",
    description:
      "Нові заявки автоматично надходять у CRM та зберігаються в одному місці.",
  },
  {
    number: "03",
    icon: <LuUsers color="#6366f1" />,
    title: "Керуйте клієнтами",
    description:
      "Обробляйте заявки, змінюйте статуси та зберігайте всю історію взаємодії з клієнтами.",
  },
];

export function HowItWorks() {
  return (
    <section className="HowItWorks" id="how-it-works">
      <div className="container">
        <h2 className="section-title">Як це працює</h2>
        <div className="HowItWorks-instruction">
          <div className="how-it-works-cards">
            {steps.map((step, i) => (
              <div key={i} className="how-it-works-card">
                <div className="how-it-works-card-top">
                  <span className="how-it-works-step-num">{step.number}</span>
                  <div className="how-it-works-icon-wrap">{step.icon}</div>
                </div>
                <h3 className="how-it-works-title">{step.title}</h3>
                <p className="how-it-works-desc">{step.description}</p>
              </div>
            ))}
          </div>
          <div className="api-example">
            {nodes.map((el, i) => (
              <Fragment key={i}>
                <div className="api-example-card">
                  {el.icon}
                  <p className="api-example-card-text">{el.label}</p>
                </div>
                {i < nodes.length - 1 && (
                  <LuArrowRight className="api-example-wrapper-next" />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
