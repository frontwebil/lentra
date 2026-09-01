import { FaArrowRight } from "react-icons/fa";
import type { Dictionary } from "@/dictionaries/uk";
import "./style.css";

type Props = {
  dict: Dictionary["hero"];
};

export function Hero({ dict }: Props) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-text-wrapper">
          <h1 className="hero-title">
            {dict.titleLines[0]} <br />
            {dict.titleLines[1]}
          </h1>
          <p className="hero-text">{dict.text}</p>
          <button className="hero-button button-try">
            <p>{dict.button}</p>
            <FaArrowRight />
          </button>
          <p className="hero-button-underbutton-text">
            {dict.underButtonLines[0]} <br /> {dict.underButtonLines[1]}
          </p>
        </div>
        <div className="hero-img"></div>
      </div>
    </section>
  );
}
