import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

await transporter.verify();

export default async function sendVerificationEmail(email, token) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email - SynkPad",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
  <h2>Welcome to SynkPad 👋</h2>

  <p>
    Please verify your email by copying the verification token below and
    pasting it into the verification page.
  </p>

  <div
    style="
      font-size: 18px;
      font-weight: bold;
      background: #f4f4f5;
      padding: 14px;
      border-radius: 6px;
      border: 1px solid #e4e4e7;
      text-align: center;
      letter-spacing: 1px;
      user-select: all;
      cursor: text;
    "
  >
    ${token}
  </div>

  <hr style="margin: 24px 0;" />

  <p style="font-size: 14px; color: #555;">
    If you did not create an account, you can safely ignore this email.
  </p>

  <p style="font-size: 13px; color: #777;">
    This verification token expires in <b>24 hours</b>.
  </p>
</div>

    `,
  };

  await transporter.sendMail(mailOptions);
}
