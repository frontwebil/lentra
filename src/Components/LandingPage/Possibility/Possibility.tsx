import { IoAnalytics } from "react-icons/io5";
import "./style.css";

import {
  MdInbox,
  MdPeople,
  MdTune,
  MdNotifications,
  MdCode,
} from "react-icons/md";
import type { Dictionary } from "@/dictionaries/uk";

const icons = [
  <MdInbox key="inbox" />,
  <MdPeople key="people" />,
  <IoAnalytics key="analytics" />,
  <MdTune key="tune" />,
  <MdNotifications key="notifications" />,
  <MdCode key="code" />,
];

type Props = {
  dict: Dictionary["possibility"];
};

export function Possibility({ dict }: Props) {
  return (
    <section className="possibility" id="possibility">
      <div className="container">
        <h2 className="section-title">{dict.title}</h2>
        <div className="possibility-cards">
          {dict.items.map((el, i) => (
            <div className="possibility-card" key={i}>
              <div className="possibility-card-icon">{icons[i]}</div>
              <h3 className="possibility-card-title">{el.label}</h3>
              <p className="possibility-card-text">{el.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
