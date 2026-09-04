"use client";

import "./style.css";

type Props = {
  email: string;
  isEnglish: boolean;
};

export function VerifyEmail({ email, isEnglish }: Props) {
  return (
    <div className="verify-email">
      <div className="verify-email-icon">✉</div>

      <h1 className="verify-email-title">
        {isEnglish ? "Check your email" : "Перевірте вашу пошту"}
      </h1>

      <p className="verify-email-description">
        {isEnglish
          ? "We’ve sent a verification link to"
          : "Ми надіслали посилання для підтвердження на"}
      </p>

      <p className="verify-email-email">{email}</p>

      <p className="verify-email-hint">
        {isEnglish
          ? "Click the link in the email to verify your account. The link is valid for 10 minutes."
          : "Перейдіть за посиланням у листі, щоб підтвердити акаунт. Посилання дійсне протягом 10 хвилин."}
      </p>

      <p className="verify-email-spam">
        {isEnglish
          ? "Didn't receive the email? Check your spam folder."
          : "Не бачите листа? Перевірте папку «Спам»."}
      </p>
    </div>
  );
}
