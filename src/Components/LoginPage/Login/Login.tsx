import Link from "next/link";

import "./style.css";

export function Login() {
  return (
    <main className="login">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h1 className="login-title">Вхід</h1>

            <p className="login-description">
              Увійдіть до свого акаунту Lentra
            </p>
          </div>

          <form className="login-form">
            <div className="login-field">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                placeholder="Введіть ваш email"
                autoComplete="email"
              />
            </div>

            <div className="login-field">
              <div className="login-password-header">
                <label htmlFor="password">Пароль</label>

                <Link href="/forgot-password">Забули пароль?</Link>
              </div>

              <input
                id="password"
                name="password"
                type="password"
                placeholder="Введіть ваш пароль"
                autoComplete="current-password"
              />
            </div>

            <button type="submit" className="login-button">
              Увійти
            </button>
          </form>

          <div className="login-footer">
            <span>Ще немає акаунту?</span>

            <Link href="/register">Зареєструватися</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
