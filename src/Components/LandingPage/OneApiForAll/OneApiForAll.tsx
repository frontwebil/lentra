"use client";

import "./style.css";
import type { Dictionary } from "@/dictionaries/uk";

type Props = {
  dict: Dictionary["oneApiForAll"];
};

export function OneApiForAll({ dict }: Props) {
  const examples = [
    {
      type: "Backend",
      title: dict.backendTitle,
      code: dict.backendCode,
    },
    {
      type: "Frontend",
      title: dict.frontendTitle,
      code: dict.frontendCode,
    },
  ];

  return (
    <div className="container">
      <section className="api-section" id="api">
        <div className="section-header">
          <h2>
            {dict.titleLines[0]}
            <br />
            {dict.titleLines[1]}
          </h2>

          <p>{dict.subtitle}</p>

          <a href="#">
            {dict.docsLink} <span>→</span>
          </a>
        </div>

        <div className="examples-grid">
          {examples.map((el) => (
            <div className="example-card" key={el.type}>
              <div className="card-header">
                <span
                  className={`card-label ${
                    el.type === "Backend" ? "label-backend" : "label-frontend"
                  }`}
                >
                  {el.type}
                </span>

                <span className="card-title">{el.title}</span>
              </div>

              <div className="code-block">
                <pre>{el.code}</pre>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
