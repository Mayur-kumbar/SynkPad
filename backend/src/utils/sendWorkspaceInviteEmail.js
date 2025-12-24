import { transporter  } from "./transporter.js";

await transporter.verify();

export default async function sendWorkspaceInviteEmail(email, token) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: "Workspace Invitation - SynkPad",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: auto;">
  <h2>Hello from SynkPad 👋</h2>

  <p>
    You have been invited to join a workspace on SynkPad.
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


  <p style="font-size: 13px; color: #777;">
    This verification token expires in <b>24 hours</b>.
  </p>
</div>

    `,
  };

  await transporter.sendMail(mailOptions);
}