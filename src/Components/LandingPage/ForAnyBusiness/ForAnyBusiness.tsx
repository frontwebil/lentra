import "./style.css";

import { LuShoppingCart, LuBriefcase, LuUsers, LuGlobe } from "react-icons/lu";

const cards = [
  {
    icon: <LuShoppingCart />,
    title: "Інтернет-магазин",
    description: "Приймайте та контролюйте замовлення з сайту.",
  },
  {
    icon: <LuBriefcase />,
    title: "Сервісний бізнес",
    description: "Збирайте заявки на послуги та звернення клієнтів.",
  },
  {
    icon: <LuUsers />,
    title: "Агенства",
    description: "Керуйте заявками з усіх ваших клієнтів в одному місці.",
  },
  {
    icon: <LuGlobe />,
    title: "Власні сайти",
    description: "Підключайте будь-який сайт через API.",
  },
];

export function ForAnyBusiness() {
  return (
    <section className="for-any-business">
      <div className="container">
        <h2 className="for-any-business-title">
          Для будь–якого бізнесу, <br />
          який отримує заявки онлайн
        </h2>
        <div className="for-any-business-cards">
          {cards.map((el, i) => (
            <div className="for-any-business-card" key={i}>
              <div className="for-any-business-card-icon">{el.icon}</div>
              <h3 className="for-any-business-card-title">{el.title}</h3>
              <p className="for-any-business-card-text">{el.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
