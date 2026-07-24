import { createEmailService } from "./index";
import { welcomeEmailTemplate } from "./templates/welcome";

const emailService = createEmailService();

export async function sendWelcomeEmail(to: string, userName: string) {
  await emailService.sendEmail(to, "Bienvenido a Sumly", welcomeEmailTemplate(userName));
}
