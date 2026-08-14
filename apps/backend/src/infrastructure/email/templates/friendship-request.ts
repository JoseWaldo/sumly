import { env } from "@/config/env";
import type { EmailContent } from "../email.service";
import { renderEmailButton, renderEmailLayout } from "./layout";

export function friendshipRequestTemplate(requesterName: string): EmailContent {
  const link = `${env.FRONTEND_URL}/dashboard/amigos?tab=solicitudes`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#002A6E;">Nueva solicitud de amistad</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hola,</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
      <strong>${requesterName}</strong> te envi&oacute; una solicitud de amistad en Sumly.
    </p>
    <p style="margin:0 0 28px;">${renderEmailButton("Ver solicitudes", link)}</p>
    <p style="margin:0;font-size:13px;color:#52637D;line-height:1.6;">
      Ingres&aacute; a Sumly para aceptar o rechazar la solicitud.
    </p>
  `;

  const html = renderEmailLayout({
    title: "Nueva solicitud de amistad en Sumly",
    preheader: `${requesterName} te envió una solicitud de amistad en Sumly.`,
    bodyHtml,
  });

  const text = [
    "Hola,",
    "",
    `${requesterName} te envió una solicitud de amistad en Sumly.`,
    "",
    `Ver solicitudes: ${link}`,
    "",
    "Ingresá a Sumly para aceptar o rechazar la solicitud.",
  ].join("\n");

  return { html, text };
}
