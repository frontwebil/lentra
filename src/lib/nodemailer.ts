import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function sendVerificationEmail(
  email: string,
  token: string,
  locale: "uk" | "en",
) {
  const isEnglish = locale === "en";

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

  const content = isEnglish
    ? {
        lang: "en",
        subject: "Confirm your email - Lentra",
        title: "Confirm your email",
        description:
          "One more small step - confirm your email address to activate your Lentra account.",
        button: "Confirm email",
        expires: "This link is valid for",
        minutes: "10 minutes",
        ignore:
          "If you didn't create an account with Lentra, simply ignore this email.",
        footer: "CRM for managing leads and customers",
      }
    : {
        lang: "uk",
        subject: "Підтвердження email - Lentra",
        title: "Підтвердіть email",
        description:
          "Ще один маленький крок - підтвердіть свою електронну адресу, щоб активувати акаунт Lentra.",
        button: "Підтвердити email",
        expires: "Посилання дійсне протягом",
        minutes: "10 хвилин",
        ignore:
          "Якщо ви не створювали акаунт у Lentra, просто проігноруйте цей лист.",
        footer: "CRM для керування заявками та клієнтами",
      };

  await transporter.sendMail({
    from: `"Lentra" <${process.env.SMTP_USER}>`,
    to: email,
    subject: content.subject,

    html: `
      <!DOCTYPE html>
      <html lang="${content.lang}">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />

          <title>${content.subject}</title>

          <link
            href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Unbounded:wght@500;600;700&display=swap"
            rel="stylesheet"
          />
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background: #f7f8fc;
          font-family: 'Montserrat', Arial, sans-serif;
          color: #0f1730;
        ">

          <table
            width="100%"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="background: #f7f8fc; padding: 40px 16px;"
          >
            <tr>
              <td align="center">

                <table
                  width="100%"
                  cellpadding="0"
                  cellspacing="0"
                  border="0"
                  style="
                    max-width: 560px;
                    background: #ffffff;
                    border-radius: 28px;
                    overflow: hidden;
                    box-shadow: 0 12px 40px rgba(15, 23, 48, 0.08);
                  "
                >

                  <!-- Header -->
                  <tr>
                    <td style="padding: 32px 36px 20px;">

                      <div style="
                        font-family: 'Unbounded', Arial, sans-serif;
                        font-size: 20px;
                        font-weight: 600;
                        letter-spacing: -0.5px;
                        color: #0f1730;
                      ">
                        Lentra<span style="color: #5b55f7;">.</span>
                      </div>

                    </td>
                  </tr>

                  <!-- Main -->
                  <tr>
                    <td style="padding: 24px 36px 36px;">

                      <h1 style="
                        margin: 0 0 14px;
                        font-family: 'Unbounded', Arial, sans-serif;
                        font-size: 25px;
                        line-height: 1.3;
                        font-weight: 600;
                        color: #0f1730;
                      ">
                        ${content.title}
                      </h1>

                      <p style="
                        margin: 0 0 28px;
                        font-size: 15px;
                        line-height: 1.6;
                        color: #30364b;
                      ">
                        ${content.description}
                      </p>

                      <!-- Button -->
                      <div style="text-align: center;">

                        <a
                          href="${verificationUrl}"
                          target="_blank"
                          style="
                            display: inline-block;
                            padding: 16px 28px;
                            background: #5b55f7;
                            color: #ffffff;
                            text-decoration: none;
                            border-radius: 16px;
                            font-family: 'Montserrat', Arial, sans-serif;
                            font-size: 14px;
                            font-weight: 600;
                            box-shadow: 0 10px 25px rgba(91, 85, 247, 0.25);
                          "
                        >
                          ${content.button}
                        </a>

                      </div>

                      <p style="
                        margin: 24px 0 0;
                        font-size: 13px;
                        line-height: 1.6;
                        color: #6b7280;
                        text-align: center;
                      ">
                        ${content.expires}
                        <strong style="color: #30364b;">
                          ${content.minutes}
                        </strong>.
                      </p>

                      <p style="
                        margin: 12px 0 0;
                        font-size: 12px;
                        line-height: 1.6;
                        color: #9ca3af;
                        text-align: center;
                      ">
                        ${content.ignore}
                      </p>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="
                      padding: 20px 36px 28px;
                      border-top: 1px solid #eef0f5;
                      text-align: center;
                    ">

                      <div style="
                        font-family: 'Unbounded', Arial, sans-serif;
                        font-size: 13px;
                        font-weight: 600;
                        color: #0f1730;
                        margin-bottom: 7px;
                      ">
                        Lentra<span style="color: #5b55f7;">.</span>
                      </div>

                      <p style="
                        margin: 0;
                        font-size: 11px;
                        color: #9ca3af;
                      ">
                        ${content.footer}
                      </p>

                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>

        </body>
      </html>
    `,
  });
}
