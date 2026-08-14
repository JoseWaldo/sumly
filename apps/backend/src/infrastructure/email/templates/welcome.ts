import { env } from "@/config/env";
import type { EmailContent } from "../email.service";
import { renderEmailButton, renderEmailLayout } from "./layout";

export function welcomeEmailTemplate(userName: string): EmailContent {
  const dashboardUrl = `${env.FRONTEND_URL}/dashboard`;

  const bodyHtml = `
    <p style="margin:0 0 16px;font-size:20px;font-weight:700;color:#002A6E;">Bienvenido a Sumly</p>
    <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hola <strong>${userName}</strong>,</p>
    <p style="margin:0 0 24px;font-size:16px;line-height:1.6;">
      Tu cuenta fue creada exitosamente. Ya pod&eacute;s empezar a registrar tus ingresos y gastos,
      gestionar suscripciones, tarjetas y deudas, todo en un solo lugar.
    </p>
    <p style="margin:0 0 28px;">${renderEmailButton("Ir al dashboard", dashboardUrl)}</p>
    <p style="margin:0;font-size:13px;color:#52637D;line-height:1.6;">
      Si no cre&aacute;ste esta cuenta, pod&eacute;s ignorar este mensaje.
    </p>
  `;

  const html = renderEmailLayout({
    title: "Bienvenido a Sumly",
    preheader: "Tu cuenta fue creada exitosamente. Empezá a gestionar tus finanzas en Sumly.",
    bodyHtml,
  });

  const text = [
    `Hola ${userName},`,
    "",
    "Tu cuenta en Sumly fue creada exitosamente. Ya podés empezar a registrar tus ingresos y gastos, gestionar suscripciones, tarjetas y deudas, todo en un solo lugar.",
    "",
    `Ir al dashboard: ${dashboardUrl}`,
    "",
    "Si no creaste esta cuenta, podés ignorar este mensaje.",
  ].join("\n");

  return { html, text };
}
