"use client";

import { useState } from "react";
import { LuArrowRight, LuCheck } from "react-icons/lu";
import "./style.css";

type FormState = {
  name: string;
  phone: string;
  email: string;
  site: string;
  message: string;
};

type Errors = Partial<Record<keyof FormState, string>>;

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  site: "",
  message: "",
};

function validate(form: FormState): Errors {
  const errors: Errors = {};

  if (form.name.trim().length < 2) {
    errors.name = "Вкажіть ваше ім’я";
  }

  if (!/^\+?[\d\s()-]{9,}$/.test(form.phone.trim())) {
    errors.phone = "Вкажіть коректний номер телефону";
  }

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Вкажіть коректний email";
  }

  return errors;
}

export function Consultation() {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  const handleChange = (field: keyof FormState) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setStatus("sending");

    try {
      // TODO: замінити на реальний ендпойнт Lentra API (POST /v1/leads)
      await new Promise((resolve) => setTimeout(resolve, 600));

      setStatus("sent");
      setForm(emptyForm);
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="consultation" id="consultation">
      <div className="container">
        <div className="consultation-inner">
          <div className="consultation-text">
            <h2 className="consultation-title">Замовити консультацію</h2>
            <p className="consultation-subtitle">
              Залиште заявку — покажемо Lentra в роботі, допоможемо підключити
              ваш сайт та налаштувати прийом заявок.
            </p>

            <ul className="consultation-benefits">
              <li>
                <LuCheck /> Демо системи під ваш бізнес
              </li>
              <li>
                <LuCheck /> Допомога з підключенням сайту та API
              </li>
              <li>
                <LuCheck /> Відповідь протягом робочого дня
              </li>
            </ul>
          </div>

          <form className="consultation-form" onSubmit={handleSubmit} noValidate>
            <div className="consultation-field">
              <label htmlFor="consultation-name">Ім’я *</label>
              <input
                id="consultation-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Іван"
                value={form.name}
                onChange={handleChange("name")}
                className={errors.name ? "has-error" : ""}
              />
              {errors.name && (
                <span className="consultation-error">{errors.name}</span>
              )}
            </div>

            <div className="consultation-field">
              <label htmlFor="consultation-phone">Телефон *</label>
              <input
                id="consultation-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+380 67 123 45 67"
                value={form.phone}
                onChange={handleChange("phone")}
                className={errors.phone ? "has-error" : ""}
              />
              {errors.phone && (
                <span className="consultation-error">{errors.phone}</span>
              )}
            </div>

            <div className="consultation-field">
              <label htmlFor="consultation-email">Email</label>
              <input
                id="consultation-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="ivan@example.com"
                value={form.email}
                onChange={handleChange("email")}
                className={errors.email ? "has-error" : ""}
              />
              {errors.email && (
                <span className="consultation-error">{errors.email}</span>
              )}
            </div>

            <div className="consultation-field">
              <label htmlFor="consultation-site">Сайт</label>
              <input
                id="consultation-site"
                name="site"
                type="text"
                placeholder="example.com"
                value={form.site}
                onChange={handleChange("site")}
              />
            </div>

            <div className="consultation-field consultation-field-full">
              <label htmlFor="consultation-message">Коментар</label>
              <textarea
                id="consultation-message"
                name="message"
                rows={3}
                placeholder="Коротко опишіть, які заявки потрібно приймати"
                value={form.message}
                onChange={handleChange("message")}
              />
            </div>

            <div className="consultation-submit-row">
              <button
                type="submit"
                className="button-try consultation-button"
                disabled={status === "sending"}
              >
                <span>
                  {status === "sending" ? "Надсилаємо…" : "Замовити консультацію"}
                </span>
                <LuArrowRight />
              </button>

              <p className="consultation-note">
                Натискаючи кнопку, ви погоджуєтесь на обробку своїх даних.
              </p>
            </div>

            {status === "sent" && (
              <p className="consultation-status success">
                Дякуємо! Заявку отримано — зв’яжемось найближчим часом.
              </p>
            )}

            {status === "error" && (
              <p className="consultation-status error">
                Не вдалося надіслати заявку. Спробуйте ще раз або напишіть нам на
                email.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
