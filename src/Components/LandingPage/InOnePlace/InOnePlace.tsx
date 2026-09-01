"use client";

import "./style.css";
import { TbForms, TbNotes, TbBell, TbUsers } from "react-icons/tb";
import { PiTelegramLogoLight } from "react-icons/pi";
import type { Dictionary } from "@/dictionaries/uk";

const icons = [TbForms, TbNotes, TbBell, TbUsers];

type Props = {
  dict: Dictionary["inOnePlace"];
};

export function InOnePlace({ dict }: Props) {
  return (
    <section className="InOnePlace">
      <div className="container">
        <div className="InOnePlace-top-container">
          <h2 className="section-title">{dict.title}</h2>
          <p className="section-subtitle">{dict.subtitle}</p>
        </div>
        <div className="InOnePlace-cards">
          {dict.cards.map((el, i) => {
            const Icon = icons[i];

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
            <h3 className="right-text-title">{dict.telegramTitle}</h3>
            <p className="right-text-description">{dict.telegramText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
