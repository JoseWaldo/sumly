import { sesEmailService } from "./ses.service";
import type { EmailService } from "./email.service";

export function createEmailService(): EmailService {
  return sesEmailService;
}

export type { EmailService };
