export interface EmailContent {
  html: string;
  text: string;
}

export interface EmailService {
  sendEmail(to: string, subject: string, content: EmailContent): Promise<void>;
}
