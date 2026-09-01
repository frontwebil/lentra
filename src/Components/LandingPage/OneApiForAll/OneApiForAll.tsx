"use client";

import "./style.css";

const examples = [
  {
    type: "Backend",
    title: "cURL / HTTP запит",

    code: `POST /api/v1/leads
Authorization: Bearer sk_live_xxxxxxxx
Content-Type: application/json

{
  "name": "Іван",
  "phone": "+380671234567",
  "email": "ivan@example.com",
  "message": "Хочу зробити замовлення"
}`,
  },

  {
    type: "Frontend",
    title: "JavaScript / fetch",

    code: `const res = await fetch(
  "https://api.lentra.tech/v1/leads",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Site-ID": "site_abc123"
    },
    body: JSON.stringify({
      "name": "Іван",
      "phone": "+380671234567",
      "email": "ivan@example.com",
      "message": "Потрібна консультація"
    })
  }
);

// API перевіряє siteId та домен сайту`,
  },
];

export function OneApiForAll() {
  return (
    <div className="container">
      <section className="api-section">
        <div className="section-header">
          <h2>
            Одне API для всіх
            <br />
            ваших заявок
          </h2>

          <p>
            Передавайте заявки з вашого сайту в Lentra - через backend або
            безпосередньо з frontend.
          </p>

          <a href="#">
            Переглянути документацію <span>→</span>
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
