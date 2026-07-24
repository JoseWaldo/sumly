export function welcomeEmailTemplate(userName: string): string {
  return `
    <div style="max-width:480px;margin:0 auto;font-family:'Hanken Grotesk',Arial,sans-serif;">
      <div style="background:#1354BE;padding:32px 24px;text-align:center;">
        <h1 style="color:#FFFFFF;margin:0;font-size:22px;font-weight:700;">Bienvenido a Sumly</h1>
      </div>
      <div style="padding:32px 24px;background:#F2F7FF;">
        <p style="font-size:16px;color:#002A6E;line-height:1.6;">
          Hola <strong>${userName}</strong>,
        </p>
        <p style="font-size:16px;color:#002A6E;line-height:1.6;">
          Tu cuenta fue creada exitosamente. Empezá a gestionar tus finanzas personales de forma sencilla.
        </p>
        <a href="http://localhost:5173/dashboard"
           style="display:inline-block;background:#1354BE;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;margin-top:8px;">
          Ir al dashboard
        </a>
        <p style="font-size:13px;color:#52637D;margin-top:24px;">
          Si no creaste esta cuenta, ignorá este mensaje.
        </p>
      </div>
    </div>
  `;
}
