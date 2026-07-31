import { createEmailService } from "./index";
import { friendshipRequestTemplate } from "./templates/friendship-request";

const emailService = createEmailService();

export async function sendFriendshipRequestEmail(to: string, requesterName: string) {
  const link = "https://app.sumly.nytrolabs.net/dashboard/amigos?tab=solicitudes";

  try {
    await emailService.sendEmail(
      to,
      `${requesterName} te envió una solicitud de amistad`,
      friendshipRequestTemplate(requesterName, link)
    );
  } catch (err) {
    console.error("Failed to send friendship request email to", to, err);
  }
}
