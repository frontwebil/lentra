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

export async function sendVerificationEmail(email: string, code: string) {
  await transporter.sendMail({
    from: `"Lentra" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Підтвердження email - Lentra",
    html: `
      <div>
        <h1>Lentra</h1>

        <p>Ваш код підтвердження:</p>

        <h2>${code}</h2>

        <p>Код дійсний протягом 10 хвилин.</p>
      </div>
    `,
  });
}
