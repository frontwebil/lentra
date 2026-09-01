"use client";

import { useState } from "react";
import { LuArrowRight, LuCheck } from "react-icons/lu";
import "./style.css";
import axios from "axios";
import type { Dictionary } from "@/dictionaries/uk";

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

type ConsultationDict = Dictionary["consultation"];

function validate(form: FormState, dict: ConsultationDict): Errors {
  const errors: Errors = {};

  if (form.name.trim().length < 2) {
    errors.name = dict.nameError;
  }

  if (!/^\+?[\d\s()-]{9,}$/.test(form.phone.trim())) {
    errors.phone = dict.phoneError;
  }

  if (
    form.email.trim() &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
  ) {
    errors.email = dict.emailError;
  }

  return errors;
}

type Props = {
  dict: ConsultationDict;
};

export function Consultation({ dict }: Props) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  const handleChange =
    (field: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const nextErrors = validate(form, dict);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) return;

    setStatus("sending");

    try {
      await axios.post("/api/Telegram/SendMessageFromLanding", form);
      setForm(emptyForm);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="consultation" id="consultation">
      <div className="container">
        <div className="consultation-inner">
          <div className="consultation-text">
            <h2 className="consultation-title">{dict.title}</h2>
            <p className="consultation-subtitle">{dict.subtitle}</p>

            <ul className="consultation-benefits">
              {dict.benefits.map((benefit) => (
                <li key={benefit}>
                  <LuCheck /> {benefit}
                </li>
              ))}
            </ul>
          </div>

          <form
            className="consultation-form"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="consultation-field">
              <label htmlFor="consultation-name">{dict.nameLabel}</label>
              <input
                id="consultation-name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder={dict.namePlaceholder}
                value={form.name}
                onChange={handleChange("name")}
                className={errors.name ? "has-error" : ""}
              />
              {errors.name && (
                <span className="consultation-error">{errors.name}</span>
              )}
            </div>

            <div className="consultation-field">
              <label htmlFor="consultation-phone">{dict.phoneLabel}</label>
              <input
                id="consultation-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                placeholder={dict.phonePlaceholder}
                value={form.phone}
                onChange={handleChange("phone")}
                className={errors.phone ? "has-error" : ""}
              />
              {errors.phone && (
                <span className="consultation-error">{errors.phone}</span>
              )}
            </div>

            <div className="consultation-field">
              <label htmlFor="consultation-email">{dict.emailLabel}</label>
              <input
                id="consultation-email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder={dict.emailPlaceholder}
                value={form.email}
                onChange={handleChange("email")}
                className={errors.email ? "has-error" : ""}
              />
              {errors.email && (
                <span className="consultation-error">{errors.email}</span>
              )}
            </div>

            <div className="consultation-field">
              <label htmlFor="consultation-site">{dict.siteLabel}</label>
              <input
                id="consultation-site"
                name="site"
                type="text"
                placeholder={dict.sitePlaceholder}
                value={form.site}
                onChange={handleChange("site")}
              />
            </div>

            <div className="consultation-field consultation-field-full">
              <label htmlFor="consultation-message">{dict.messageLabel}</label>
              <textarea
                id="consultation-message"
                name="message"
                rows={3}
                placeholder={dict.messagePlaceholder}
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
                <span>{status === "sending" ? dict.submitting : dict.submit}</span>
                <LuArrowRight />
              </button>

              <p className="consultation-note">{dict.note}</p>
            </div>

            {status === "sent" && (
              <p className="consultation-status success">{dict.success}</p>
            )}

            {status === "error" && (
              <p className="consultation-status error">{dict.error}</p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
