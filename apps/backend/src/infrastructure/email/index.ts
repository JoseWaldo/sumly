import { smtpEmailService } from "./smtp.service";
import type { EmailService } from "./email.service";

export function createEmailService(): EmailService {
  return smtpEmailService;
}

export type { EmailService };
