import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";
import type { Dictionary } from "@/dictionaries/uk";
import "./style.css";

type Props = {
  dict: Dictionary["productTour"];
};

const screenshots = [
  "/Photos CRM/EN/all-leads-page.jpg",
  "/Photos CRM/EN/lead-inner.png",
  "/Photos CRM/EN/calendar.jpg",
  "/Photos CRM/EN/connect-site.jpg",
];

export function ProductTour({ dict }: Props) {
  return (
    <section className="product-tour" id="product">
      <div className="container">
        <div className="product-tour-heading">
          <span className="product-tour-eyebrow">{dict.eyebrow}</span>
          <h2>{dict.title}</h2>
          <p>{dict.subtitle}</p>
        </div>

        <div className="product-tour-list">
          {dict.features.map((feature, index) => (
            <article className="product-tour-feature" key={feature.title}>
              <div className="product-tour-copy">
                <span className="product-tour-number">0{index + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="product-tour-points">
                  {feature.points.map((point) => (
                    <span key={point}>
                      <span className="product-tour-check" aria-hidden="true">✓</span>
                      {point}
                    </span>
                  ))}
                </div>
              </div>
              <div className="product-tour-visual">
                <div className="product-tour-image-frame">
                  <div className="product-tour-window-bar" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <span>Lentra · {feature.screenLabel}</span>
                  </div>
                  <Image
                    src={screenshots[index]}
                    alt={feature.imageAlt}
                    width={1906}
                    height={910}
                    sizes="(max-width: 900px) 100vw, 60vw"
                  />
                </div>
                <div className="product-tour-float" aria-hidden="true">
                  <span className="product-tour-float-dot" />
                  {feature.note}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="product-tour-cta">
          <p>{dict.ctaText}</p>
          <Link href="/register" className="product-tour-button">
            {dict.ctaButton} <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
