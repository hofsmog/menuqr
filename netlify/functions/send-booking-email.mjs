export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { name, email, phone, date, time, guests, restaurantName, status } = await req.json();

  const RESEND_API_KEY = process.env.RESEND_API_KEY;

  if (!RESEND_API_KEY) {
    console.error('Booking email endpoint misconfigured: missing RESEND_API_KEY');
    return new Response(JSON.stringify({ ok: false, error: 'Email service misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

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
    <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
    <body style="margin:0;padding:0;background:#f5f0e8;font-family:'Helvetica Neue',Arial,sans-serif;">
      <div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background:#1a1208;padding:32px;text-align:center;">
          <div style="font-size:1.6rem;color:#c8973a;font-weight:bold;letter-spacing:0.02em;">MenuQR</div>
          <div style="color:rgba(245,240,232,0.5);font-size:0.8rem;margin-top:4px;">Digital meny & bokning</div>
        </div>

        <!-- Status banner -->
        <div style="background:${isConfirmed ? '#5a7a5a' : '#b54a2a'};padding:20px;text-align:center;">
          <div style="color:white;font-size:1.1rem;font-weight:600;">
            ${isConfirmed ? '✓ Bokning bekräftad!' : '✕ Bokning avbokad'}
          </div>
        </div>

        <!-- Content -->
        <div style="padding:36px;">
          <p style="color:#444;font-size:0.95rem;line-height:1.7;margin:0 0 24px;">
            Hej ${name}! ${isConfirmed
              ? `Din bordsbokning på <strong>${restaurantName}</strong> är nu bekräftad. Vi ser fram emot ditt besök!`
              : `Din bordsbokning på <strong>${restaurantName}</strong> har tyvärr behövt avbokas. Kontakta restaurangen för mer information.`
            }
          </p>

          <!-- Booking details -->
          <div style="background:#faf7f2;border-radius:12px;padding:24px;margin-bottom:24px;">
            <div style="font-size:0.75rem;color:#999;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:16px;">Bokningsdetaljer</div>
            <table style="width:100%;border-collapse:collapse;">
              <tr><td style="padding:8px 0;color:#888;font-size:0.85rem;width:40%;">Restaurang</td><td style="padding:8px 0;font-weight:600;font-size:0.9rem;color:#1a1208;">${restaurantName}</td></tr>
              <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#888;font-size:0.85rem;">Datum</td><td style="padding:8px 0;font-weight:600;font-size:0.9rem;color:#1a1208;">${dateFormatted}</td></tr>
              <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#888;font-size:0.85rem;">Tid</td><td style="padding:8px 0;font-weight:600;font-size:0.9rem;color:#1a1208;">${time}</td></tr>
              <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#888;font-size:0.85rem;">Antal gäster</td><td style="padding:8px 0;font-weight:600;font-size:0.9rem;color:#1a1208;">${guests} ${guests === 1 ? 'person' : 'personer'}</td></tr>
              <tr style="border-top:1px solid #eee;"><td style="padding:8px 0;color:#888;font-size:0.85rem;">Telefon</td><td style="padding:8px 0;font-weight:600;font-size:0.9rem;color:#1a1208;">${phone}</td></tr>
            </table>
          </div>

          ${isConfirmed ? `
          <p style="color:#888;font-size:0.82rem;line-height:1.6;margin:0;">
            Behöver du ändra eller avboka? Kontakta restaurangen direkt.
          </p>` : ''}
        </div>

        <!-- Footer -->
        <div style="background:#faf7f2;padding:20px;text-align:center;border-top:1px solid #eee;">
          <div style="font-size:0.72rem;color:#bbb;">Bokningssystem via <a href="https://menuqr.se" style="color:#c8973a;text-decoration:none;">MenuQR</a></div>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MenuQR <bokningar@menuqr.se>',
        to: [email],
        subject,
        html
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Resend error');

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: '/api/send-booking-email' };
