export function friendshipRequestTemplate(requesterName: string, link: string): string {
  return `
    <div style="max-width:480px;margin:0 auto;font-family:'Hanken Grotesk',Arial,sans-serif;">
      <div style="background:#1354BE;padding:32px 24px;text-align:center;">
        <h1 style="color:#FFFFFF;margin:0;font-size:22px;font-weight:700;">Sumly</h1>
      </div>
      <div style="padding:32px 24px;background:#F2F7FF;">
        <p style="font-size:16px;color:#002A6E;line-height:1.6;">
          Hola,
        </p>
        <p style="font-size:16px;color:#002A6E;line-height:1.6;">
          <strong>${requesterName}</strong> te envi&oacute; una solicitud de amistad en Sumly.
        </p>
        <a href="${link}"
           style="display:inline-block;background:#1354BE;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;">
          Ver solicitudes
        </a>
        <p style="font-size:13px;color:#52637D;margin-top:24px;">
          Ingres&aacute; a Sumly para aceptar o rechazar la solicitud.
        </p>
      </div>
    </div>
  `;
}
