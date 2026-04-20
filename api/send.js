export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { nombre, empresa, email, telefono, dolor, empleados, entornos } = req.body;

  if (!nombre || !empresa || !email || !dolor) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return res.status(500).json({ error: 'RESEND_API_KEY no configurada' });
  }

  const entornosStr = Array.isArray(entornos) && entornos.length > 0
    ? entornos.join(', ')
    : '—';

  // ─── Email a ventas ───────────────────────────────────────────
  const salesHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F3F3F5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F3F5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0F1117;padding:28px 36px;text-align:center;">
            <span style="font-size:28px;font-weight:900;letter-spacing:-0.03em;">
              <span style="color:#2B6FD4;">time</span><span style="color:#F5831F;">kia</span>
            </span>
            <p style="color:#8892A4;font-size:12px;margin:8px 0 0;letter-spacing:.12em;text-transform:uppercase;">Nueva consulta de diagnóstico</p>
          </td>
        </tr>

        <!-- Alert bar -->
        <tr>
          <td style="background:#F5831F;padding:12px 36px;text-align:center;">
            <span style="color:#fff;font-weight:700;font-size:14px;letter-spacing:.08em;text-transform:uppercase;">
              🔔 Nuevo lead — responder en menos de 2 horas
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 36px 20px;">
            <h2 style="margin:0 0 24px;font-size:20px;font-weight:800;color:#0F1117;">Datos del contacto</h2>

            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['Nombre', nombre],
                ['Empresa', empresa],
                ['Email', `<a href="mailto:${email}" style="color:#2B6FD4;">${email}</a>`],
                ['Teléfono', telefono || '—'],
              ].map(([label, value]) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F3F3F5;width:140px;">
                  <span style="font-size:11px;font-weight:700;color:#8892A4;text-transform:uppercase;letter-spacing:.1em;">${label}</span>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #F3F3F5;">
                  <span style="font-size:14px;color:#0F1117;font-weight:500;">${value}</span>
                </td>
              </tr>`).join('')}
            </table>

            <h2 style="margin:28px 0 16px;font-size:20px;font-weight:800;color:#0F1117;">Diagnóstico</h2>

            <table width="100%" cellpadding="0" cellspacing="0">
              ${[
                ['Dolor principal', dolor],
                ['Empleados', empleados || '—'],
                ['Entornos', entornosStr],
              ].map(([label, value]) => `
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #F3F3F5;width:140px;">
                  <span style="font-size:11px;font-weight:700;color:#8892A4;text-transform:uppercase;letter-spacing:.1em;">${label}</span>
                </td>
                <td style="padding:10px 0;border-bottom:1px solid #F3F3F5;">
                  <span style="font-size:14px;color:#0F1117;font-weight:500;">${value}</span>
                </td>
              </tr>`).join('')}
            </table>

            <!-- CTA -->
            <div style="margin:32px 0;text-align:center;">
              <a href="mailto:${email}?subject=Diagnóstico Timekia — ${empresa}"
                 style="background:#F5831F;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:14px;display:inline-block;">
                Responder a ${nombre.split(' ')[0]} →
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F3F3F5;padding:20px 36px;text-align:center;">
            <p style="color:#8892A4;font-size:11px;margin:0;">InflexiumLabs · Montevideo, Uruguay · ventas@inflexiumlabs.com</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  // ─── Email de confirmación al usuario ─────────────────────────
  const confirmHtml = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F3F3F5;font-family:'Inter',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F3F5;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr>
          <td style="background:#0F1117;padding:36px;text-align:center;">
            <span style="font-size:32px;font-weight:900;letter-spacing:-0.03em;">
              <span style="color:#2B6FD4;">time</span><span style="color:#F5831F;">kia</span>
            </span>
            <p style="color:#8892A4;font-size:12px;margin:10px 0 0;letter-spacing:.1em;text-transform:uppercase;">Control de horario sin fricción</p>
          </td>
        </tr>

        <!-- Green bar -->
        <tr>
          <td style="background:#22C55E;padding:14px 36px;text-align:center;">
            <span style="color:#fff;font-weight:700;font-size:14px;">✓ Recibimos tu consulta, ${nombre.split(' ')[0]}.</span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px;">
            <p style="font-size:16px;color:#0F1117;line-height:1.6;margin:0 0 16px;">
              Gracias por contactarnos. Nuestro equipo revisará tu caso y te escribirá en menos de <strong>2 horas hábiles</strong> con el link para agendar los 15 minutos de diagnóstico.
            </p>

            <!-- Summary box -->
            <div style="background:#F8F8FA;border-radius:12px;padding:20px 24px;margin:24px 0;border-left:3px solid #F5831F;">
              <p style="font-size:11px;font-weight:700;color:#F5831F;letter-spacing:.12em;text-transform:uppercase;margin:0 0 12px;">Tu consulta</p>
              <p style="margin:4px 0;font-size:13px;color:#0F1117;"><strong>Empresa:</strong> ${empresa}</p>
              <p style="margin:4px 0;font-size:13px;color:#0F1117;"><strong>Dolor principal:</strong> ${dolor}</p>
              <p style="margin:4px 0;font-size:13px;color:#0F1117;"><strong>Equipo:</strong> ${empleados || '—'} empleados</p>
              <p style="margin:4px 0;font-size:13px;color:#0F1117;"><strong>Entornos:</strong> ${entornosStr}</p>
            </div>

            <p style="font-size:15px;color:#0F1117;font-weight:600;margin:28px 0 16px;">Mientras tanto, explorá nuestras soluciones:</p>

            <!-- Product cards -->
            <table width="100%" cellpadding="0" cellspacing="8" style="margin-bottom:24px;">
              <tr>
                <td width="48%" style="background:#F8F8FA;border-radius:10px;padding:16px;vertical-align:top;">
                  <p style="font-size:11px;font-weight:700;color:#2B6FD4;letter-spacing:.12em;text-transform:uppercase;margin:0 0 6px;">tiempo y asistencia</p>
                  <p style="font-size:16px;font-weight:900;margin:0 0 6px;color:#0F1117;">
                    <span style="color:#2B6FD4;">time</span><span style="color:#F5831F;">kia</span>
                  </p>
                  <p style="font-size:12px;color:#6B7280;margin:0 0 10px;line-height:1.4;">Fichaje facial, kiosko wall, 100% offline.</p>
                  <a href="https://timekia.inflexiumlabs.com" style="color:#2B6FD4;font-size:12px;font-weight:700;text-decoration:none;">timekia.inflexiumlabs.com →</a>
                </td>
                <td width="4%"></td>
                <td width="48%" style="background:#F8F8FA;border-radius:10px;padding:16px;vertical-align:top;">
                  <p style="font-size:11px;font-weight:700;color:#7C3AED;letter-spacing:.12em;text-transform:uppercase;margin:0 0 6px;">apps de negocio</p>
                  <p style="font-size:16px;font-weight:900;margin:0 0 6px;color:#0F1117;">
                    <span style="color:#7C3AED;">Odoo</span><span style="color:#EC4899;">Más</span>
                  </p>
                  <p style="font-size:12px;color:#6B7280;margin:0 0 10px;line-height:1.4;">Partner Oficial Odoo. ERP, RRHH, nómina.</p>
                  <a href="https://odoomas.inflexiumlabs.com" style="color:#7C3AED;font-size:12px;font-weight:700;text-decoration:none;">odoomas.inflexiumlabs.com →</a>
                </td>
              </tr>
            </table>

            <!-- WhatsApp CTA -->
            <div style="background:#25D366;border-radius:10px;padding:16px 20px;text-align:center;margin-bottom:8px;">
              <a href="https://wa.me/59897574400"
                 style="color:#fff;text-decoration:none;font-weight:700;font-size:14px;display:block;">
                💬 ¿Urgente? Escribinos por WhatsApp → wa.me/59897574400
              </a>
            </div>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0F1117;padding:24px 36px;text-align:center;">
            <p style="color:#8892A4;font-size:12px;margin:0 0 8px;font-weight:700;">
              <span style="color:#2B6FD4;">time</span><span style="color:#F5831F;">kia</span>
              &nbsp;·&nbsp;
              <span style="color:#7C3AED;">Odoo</span><span style="color:#EC4899;">Más</span>
            </p>
            <p style="color:#8892A4;font-size:11px;margin:0;">InflexiumLabs · Montevideo, Uruguay</p>
            <p style="margin:8px 0 0;">
              <a href="mailto:ventas@inflexiumlabs.com" style="color:#8892A4;font-size:11px;">ventas@inflexiumlabs.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    const sendEmail = async (payload) => {
      const r = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const err = await r.text();
        throw new Error(`Resend error: ${err}`);
      }
      return r.json();
    };

    // Send both in parallel
    await Promise.all([
      sendEmail({
        from: 'Timekia <noreply@inflexiumlabs.com>',
        to: ['ventas@inflexiumlabs.com'],
        subject: `🔔 Nuevo diagnóstico: ${nombre} — ${empresa}`,
        html: salesHtml,
      }),
      sendEmail({
        from: 'Timekia <noreply@inflexiumlabs.com>',
        to: [email],
        reply_to: 'ventas@inflexiumlabs.com',
        subject: `Recibimos tu consulta, ${nombre.split(' ')[0]} — te contactamos pronto`,
        html: confirmHtml,
      }),
    ]);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Resend error:', err);
    return res.status(500).json({ error: 'Error enviando email' });
  }
}
