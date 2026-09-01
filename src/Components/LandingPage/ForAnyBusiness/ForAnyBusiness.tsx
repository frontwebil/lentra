import "./style.css";

import { LuShoppingCart, LuBriefcase, LuUsers, LuGlobe } from "react-icons/lu";
import type { Dictionary } from "@/dictionaries/uk";

const icons = [
  <LuShoppingCart key="cart" />,
  <LuBriefcase key="briefcase" />,
  <LuUsers key="users" />,
  <LuGlobe key="globe" />,
];

type Props = {
  dict: Dictionary["forAnyBusiness"];
};

export function ForAnyBusiness({ dict }: Props) {
  return (
    <section className="for-any-business">
      <div className="container">
        <h2 className="for-any-business-title">
          {dict.titleLines[0]} <br />
          {dict.titleLines[1]}
        </h2>
        <div className="for-any-business-cards">
          {dict.cards.map((el, i) => (
            <div className="for-any-business-card" key={i}>
              <div className="for-any-business-card-icon">{icons[i]}</div>
              <h3 className="for-any-business-card-title">{el.title}</h3>
              <p className="for-any-business-card-text">{el.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
