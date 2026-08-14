interface EmailLayoutOptions {
  title: string;
  preheader: string;
  bodyHtml: string;
}

export function renderEmailLayout({ title, preheader, bodyHtml }: EmailLayoutOptions): string {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="color-scheme" content="light" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#EEF3FB;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:#EEF3FB;">
      ${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
    </div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#EEF3FB;">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background-color:#FFFFFF;border-radius:16px;overflow:hidden;">
            <tr>
              <td style="background-color:#1354BE;padding:28px 32px;text-align:center;">
                <span style="font-family:'Hanken Grotesk',Arial,sans-serif;font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:0.3px;">Sumly</span>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px;font-family:'Hanken Grotesk',Arial,sans-serif;color:#002A6E;">
                ${bodyHtml}
              </td>
            </tr>
            <tr>
              <td style="padding:20px 32px;background-color:#F7FAFF;border-top:1px solid #E3ECFA;text-align:center;">
                <p style="margin:0;font-size:12px;color:#7C8CA6;font-family:Arial,sans-serif;line-height:1.5;">
                  &copy; ${new Date().getFullYear()} Sumly &middot; Gesti&oacute;n financiera personal
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderEmailButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background-color:#1354BE;color:#FFFFFF;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;font-family:'Hanken Grotesk',Arial,sans-serif;">${label}</a>`;
}
