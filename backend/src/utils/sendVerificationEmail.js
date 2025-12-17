import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  secure: false, 
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

await transporter.verify();

export default async function sendVerificationEmail(email, token) {
  const verifyUrl = `http://localhost:3000/verify-email?token=${token}`

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Verify your email - SynkPad",
    html: `
      <div style="font-family: Arial, sans-serif">
        <h2>Welcome to SynkPad 👋</h2>
        <p>Please verify your email by clicking the button below:</p>
        <a href="${verifyUrl}"
           style="display:inline-block;padding:10px 16px;background:#4f46e5;color:white;text-decoration:none;border-radius:4px;">
           Verify Email
        </a>
        <p>This link expires in 24 hours.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
}
