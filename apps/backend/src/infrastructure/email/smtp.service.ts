import nodemailer from "nodemailer";

import { env } from "@/config/env";
import type { EmailService } from "./email.service";

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export const smtpEmailService: EmailService = {
  async sendEmail(to, subject, html) {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    });
  },
};
