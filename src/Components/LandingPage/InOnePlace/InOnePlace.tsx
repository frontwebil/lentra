"use client";

import "./style.css";
import { TbForms, TbNotes, TbBell, TbUsers } from "react-icons/tb";
import { PiTelegramLogoLight } from "react-icons/pi";

const cards = [
  {
    icon: TbForms,
    title: "Заявки з сайту",
    desc: "Форми з сайту одразу потрапляють у CRM - жодна не загубиться.",
  },
  {
    icon: TbNotes,
    title: "Коментарі та нотатки",
    desc: "Менеджер залишає нотатки прямо в картці клієнта - все на виду.",
  },
  {
    icon: TbBell,
    title: "Нагадування",
    desc: "Поставте нагадування по клієнту - у потрібний час воно прийде в повідомлення в crm і в Telegram.",
  },
  {
    icon: TbUsers,
    title: "Історія клієнта",
    desc: "Повна історія взаємодії з клієнтом зберігається в його картці: статуси, нотатки, дати та час кожної зміни.",
  },
];

export function InOnePlace() {
  return (
    <section className="InOnePlace">
      <div className="container">
        <div className="InOnePlace-top-container">
          <h2 className="section-title">
            Усі заявки — в одному місці
          </h2>
          <p className="section-subtitle">
            Усі заявки автоматично потрапляють у CRM, щоб ви могли швидко знайти
            потрібну та не втратити жодного клієнта.
          </p>
        </div>
        <div className="InOnePlace-cards">
          {cards.map((el, i) => {
            const Icon = el.icon;

            return (
              <div className="InOnePlace-card" key={i}>
                <div className="InOnePlace-card-icon">
                  <Icon />
                </div>

                <h3 className="InOnePlace-card-title">{el.title}</h3>

                <p className="InOnePlace-card-desc">{el.desc}</p>
              </div>
            );
          })}
        </div>
        <div className="InOnePlace-telegram-message">
          <div className="left-icon">
            <PiTelegramLogoLight />
          </div>
          <div className="right-text">
            <h3 className="right-text-title">
              Сповіщення в Telegram - миттєво
            </h3>
            <p className="right-text-description">
              Нова заявка, зміна статусу замовлення або нагадування від
              менеджера - все приходить прямо в чат.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
