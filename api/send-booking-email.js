export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, date, time, guests, restaurantName, status } = req.body;
  const RESEND_API_KEY = 're_h1v8pANG_9rAjLJiH4MGQD4EaDjt78ME8';

  const dateFormatted = new Date(date).toLocaleDateString('sv-SE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const isConfirmed = status === 'confirmed';
  const subject = isConfirmed
    ? `✓ Din bokning på ${restaurantName} är bekräftad`
    : `Din bokning på ${restaurantName} är avbokad`;

  const html = `
    <!DOCTYPE html>
    <html lang="sv">
    <head><meta charset="UTF-8"></head>
    <body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <div style="background:#1a1208;padding:32px;text-align:center;">
          <div style="font-size:1.6rem;color:#c8973a;font-weight:bold;">MenuQR</div>
          <div style="color:rgba(245,240,232,0.5);font-size:0.8rem;margin-top:4px;">Digital meny & bokning</div>
        </div>
        <div style="background:${isConfirmed ? '#5a7a5a' : '#b54a2a'};padding:20px;text-align:center;">
          <div style="color:white;font-size:1.1rem;font-weight:600;">
            ${isConfirmed ? '✓ Bokning bekräftad!' : '✕ Bokning avbokad'}
          </div>
        </div>
        <div style="padding:36px;">
          <p style="color:#444;font-size:0.95rem;line-height:1.7;margin:0 0 24px;">
            Hej ${name}! ${isConfirmed
              ? `Din bordsbokning på <strong>${restaurantName}</strong> är nu bekräftad.`
              : `Din bordsbokning på <strong>${restaurantName}</strong> har tyvärr behövt avbokas.`
            }
          </p>
          <div style="background:#faf7f2;border-radius:12px;padding:24px;margin-bottom:24px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#888;font-size:0.85rem;width:40%;">Restaurang</td><td style="padding:8px 0;font-weight:600;font-size:0.9rem;">${restaurantName}</td></tr>
              <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#888;font-size:0.85rem;">Datum</td><td style="padding:8px 0;font-weight:600;font-size:0.9rem;">${dateFormatted}</td></tr>
              <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#888;font-size:0.85rem;">Tid</td><td style="padding:8px 0;font-weight:600;font-size:0.9rem;">${time}</td></tr>
              <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#888;font-size:0.85rem;">Gäster</td><td style="padding:8px 0;font-weight:600;font-size:0.9rem;">${guests} personer</td></tr>
              <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#888;font-size:0.85rem;">Telefon</td><td style="padding:8px 0;font-weight:600;font-size:0.9rem;">${phone}</td></tr>
            </table>
          </div>
        </div>
        <div style="background:#faf7f2;padding:20px;text-align:center;border-top:1px solid #eee;">
          <div style="font-size:0.72rem;color:#bbb;">Bokningssystem via <a href="https://menuqr.se" style="color:#c8973a;text-decoration:none;">MenuQR</a></div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ from: 'MenuQR <bokningar@menuqr.se>', to: [email], subject, html })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Resend error');

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
