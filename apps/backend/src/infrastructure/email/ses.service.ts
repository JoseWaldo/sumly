import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

import { env } from "@/config/env";
import type { EmailService } from "./email.service";

const client = new SESv2Client({
  region: env.AWS_REGION,
  credentials: {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  },
});

export const sesEmailService: EmailService = {
  async sendEmail(to, subject, { html, text }) {
    await client.send(
      new SendEmailCommand({
        FromEmailAddress: `${env.SES_FROM_NAME} <${env.SES_FROM_EMAIL}>`,
        Destination: { ToAddresses: [to] },
        Content: {
          Simple: {
            Subject: { Data: subject, Charset: "UTF-8" },
            Body: {
              Html: { Data: html, Charset: "UTF-8" },
              Text: { Data: text, Charset: "UTF-8" },
            },
          },
        },
      })
    );
  },
};
