import Link from "next/link";

import "./style.css";

export function Register() {
  return (
    <main className="register">
      <div className="register-container">
        <div className="register-card">
          <div className="register-header">
            <h1 className="register-title">Реєстрація</h1>

            <p className="register-description">Створіть акаунт у Lentra</p>
          </div>

          <form className="register-form">
            <div className="register-row">
              <div className="register-field">
                <label htmlFor="firstName">Ім{"'"}я</label>

                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="Ім'я"
                  autoComplete="given-name"
                />
              </div>

              <div className="register-field">
                <label htmlFor="lastName">Прізвище</label>

                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Прізвище"
                  autoComplete="family-name"
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Введіть ваш email"
                autoComplete="email"
              />
            </div>

            <div className="register-field">
              <label htmlFor="password">Пароль</label>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Створіть пароль"
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="register-button">
              Створити акаунт
            </button>
          </form>

          <div className="register-footer">
            <span>Вже маєте акаунт?</span>

            <Link href="/login">Увійти</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
