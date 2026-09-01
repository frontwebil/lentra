"use client";

import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { questions } from "./questions";
import "./style.css";

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
