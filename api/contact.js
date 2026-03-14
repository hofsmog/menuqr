const RESEND_API_KEY = 're_h1v8pANG_9rAjLJiH4MGQD4EaDjt78ME8';

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { name, email, message, type } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Fyll i alla fält' });

  const typeLabel = type === 'restaurant' ? 'Restaurang' : 'Kund';

  const html = '<html><body style="font-family:Arial,sans-serif;background:#f5f0e8;">'
    + '<div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;">'
    + '<div style="background:#1a1208;padding:28px;text-align:center;"><div style="font-size:1.3rem;color:#c8973a;font-weight:bold;">MenuQR – Ny kontakt</div></div>'
    + '<div style="padding:32px;">'
    + '<table style="width:100%;border-collapse:collapse;background:#faf7f2;border-radius:8px;">'
    + '<tr><td style="padding:10px 14px;color:#888;width:35%;">Typ</td><td style="padding:10px 14px;font-weight:600;">' + typeLabel + '</td></tr>'
    + '<tr style="border-top:1px solid #eee;"><td style="padding:10px 14px;color:#888;">Namn</td><td style="padding:10px 14px;font-weight:600;">' + name + '</td></tr>'
    + '<tr style="border-top:1px solid #eee;"><td style="padding:10px 14px;color:#888;">E-post</td><td style="padding:10px 14px;font-weight:600;"><a href="mailto:' + email + '">' + email + '</a></td></tr>'
    + '<tr style="border-top:1px solid #eee;"><td style="padding:10px 14px;color:#888;vertical-align:top;">Meddelande</td><td style="padding:10px 14px;">' + message.replace(/\n/g, '<br>') + '</td></tr>'
    + '</table>'
    + '</div></div></body></html>';

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MenuQR <support@menuqr.se>',
        to: ['support@menuqr.se'],
        reply_to: email,
        subject: 'Ny kontakt fran ' + name + ' (' + typeLabel + ')',
        html
      })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Resend error');

    // Skicka bekräftelse till avsändaren
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + RESEND_API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'MenuQR <support@menuqr.se>',
        to: [email],
        subject: 'Vi har tagit emot ditt meddelande!',
        html: '<html><body style="font-family:Arial,sans-serif;background:#f5f0e8;">'
          + '<div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;">'
          + '<div style="background:#1a1208;padding:28px;text-align:center;"><div style="font-size:1.3rem;color:#c8973a;font-weight:bold;">MenuQR</div></div>'
          + '<div style="padding:32px;">'
          + '<p style="color:#444;line-height:1.7;">Hej ' + name + '!</p>'
          + '<p style="color:#444;line-height:1.7;">Tack for ditt meddelande! Vi aterkomkommer inom 1-2 arbetsdagar.</p>'
          + '<p style="color:#888;font-size:0.85rem;margin-top:24px;">Med vanliga halsningar,<br>MenuQR-teamet</p>'
          + '</div></div></body></html>'
      })
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Contact email error:', err.message);
    return res.status(500).json({ error: err.message });
  }
};
