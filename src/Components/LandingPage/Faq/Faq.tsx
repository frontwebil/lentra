"use client";

import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import "./style.css";

const questions = [
  {
    question: "Що це за сервіс?",
    answer:
      "Lentra — це CRM для заявок. Усі звернення з ваших сайтів автоматично потрапляють в одну систему, де ви бачите історію клієнта, статуси та нотатки менеджерів.",
  },
  {
    question: "Як підключити сайт?",
    answer:
      "Створюєте API-ключ у кабінеті та надсилаєте заявки на наш ендпойнт — з backend або напряму з форми на сайті. Підключення займає кілька хвилин, приклади запитів є в документації.",
  },
  {
    question: "Чи можна підключити декілька сайтів?",
    answer:
      "Так. Кожен сайт має власний Site ID, тому заявки не змішуються: ви можете фільтрувати їх за джерелом і працювати з усіма проєктами в одному акаунті.",
  },
  {
    question: "Чи потрібні навички програмування?",
    answer:
      "Ні. Якщо у вас немає розробника — ми допоможемо підключити Lentra до вашого сайту та налаштувати прийом заявок. Достатньо залишити заявку на консультацію нижче.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="faq" id="faq">
      <div className="container">
        <h2 className="section-title">Поширені запитання</h2>

        <div className="faq-list">
          {questions.map((el, i) => {
            const isOpen = openIndex === i;

            return (
              <div className={`faq-item ${isOpen ? "open" : ""}`} key={i}>
                <button
                  type="button"
                  className="faq-question"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                >
                  <span>{el.question}</span>
                  <LuChevronDown className="faq-chevron" />
                </button>

                <div className="faq-answer-wrapper">
                  <p className="faq-answer">{el.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
