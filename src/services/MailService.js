import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

import ActivationEmail from "../emails/ActivationEmail.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendActivationEmail = async (
  email,
  name,
  unit,
  token
) => {
  const activationLink =
    `${process.env.FRONTEND_URL}/activate-account?token=${token}`;

  await transporter.sendMail({
    from: `"AQUORA" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Aktivasi Akun AQUORA Anda",

  html: ActivationEmail({
  unit,
  activationLink,
}),

    attachments: [
      {
        filename: "Logo.png",
        path: path.join(__dirname, "../assets/Logo.png"),
        cid: "aquoraLogo",
      },
    ],
  });
};