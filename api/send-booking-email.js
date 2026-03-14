const RESEND_API_KEY = 're_h1v8pANG_9rAjLJiH4MGQD4EaDjt78ME8';
const SUPABASE_URL = 'https://bvqlgxkarepnpjzvpoqg.supabase.co';

async function getOwnerEmail(restaurantId) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/restaurants?id=eq.${restaurantId}&select=user_id`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
    }
  });
  const data = await res.json();
  const userId = data?.[0]?.user_id;
  if (!userId) return null;
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${userId}`, {
    headers: {
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`
    }
  });
  const userData = await userRes.json();
  return userData?.email || null;
}

async function sendEmail(to, subject, html) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ from: 'MenuQR <bokningar@menuqr.se>', to: [to], subject, html })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Resend error');
  return data;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, date, time, guests, restaurantName, status, toRestaurant, restaurantId } = req.body;

  const dateFormatted = new Date(date).toLocaleDateString('sv-SE', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  try {
    if (toRestaurant && restaurantId) {
      const ownerEmail = await getOwnerEmail(restaurantId);
      if (!ownerEmail) return res.status(400).json({ error: 'Could not find owner email' });

      const subject = 'Ny bokningsforfragan pa ' + restaurantName;
      const html = '<html><body style="font-family:Arial,sans-serif;background:#f5f0e8;">'
        + '<div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;">'
        + '<div style="background:#1a1208;padding:32px;text-align:center;"><div style="font-size:1.4rem;color:#c8973a;font-weight:bold;">MenuQR</div></div>'
        + '<div style="background:#c8973a;padding:20px;text-align:center;"><div style="color:white;font-size:1rem;font-weight:600;">Ny bokningsforfragan!</div></div>'
        + '<div style="padding:32px;">'
        + '<p style="color:#444;margin:0 0 20px;">Du har fatt en ny bokningsforfragan pa <strong>' + restaurantName + '</strong>.</p>'
        + '<table style="width:100%;border-collapse:collapse;background:#faf7f2;border-radius:8px;padding:16px;">'
        + '<tr><td style="padding:8px;color:#888;">Gast</td><td style="padding:8px;font-weight:600;">' + name + '</td></tr>'
        + '<tr style="border-top:1px solid #eee;"><td style="padding:8px;color:#888;">Datum</td><td style="padding:8px;font-weight:600;">' + dateFormatted + '</td></tr>'
        + '<tr style="border-top:1px solid #eee;"><td style="padding:8px;color:#888;">Tid</td><td style="padding:8px;font-weight:600;">' + time + '</td></tr>'
        + '<tr style="border-top:1px solid #eee;"><td style="padding:8px;color:#888;">Gaster</td><td style="padding:8px;font-weight:600;">' + guests + ' personer</td></tr>'
        + '<tr style="border-top:1px solid #eee;"><td style="padding:8px;color:#888;">Telefon</td><td style="padding:8px;font-weight:600;">' + (phone || '-') + '</td></tr>'
        + '</table>'
        + '<a href="https://menuqr.se?booking_date=' + date + '" style="display:block;margin-top:20px;background:#1a1208;color:#f5f0e8;text-align:center;padding:14px;border-radius:8px;text-decoration:none;font-weight:500;">Visa bokning pa MenuQR</a>'
        + '</div></div></body></html>';

      await sendEmail(ownerEmail, subject, html);

    } else {
      if (!email) return res.status(400).json({ error: 'No guest email' });
      const isConfirmed = status === 'confirmed';
      const subject = isConfirmed
        ? 'Din bokning pa ' + restaurantName + ' ar bekraftad'
        : 'Din bokning pa ' + restaurantName + ' ar avbokad';

      const statusColor = isConfirmed ? '#5a7a5a' : '#b54a2a';
      const statusText = isConfirmed ? 'Bokning bekraftad!' : 'Bokning avbokad';
      const bodyText = isConfirmed
        ? 'Din bordsbokning pa ' + restaurantName + ' ar nu bekraftad.'
        : 'Din bordsbokning pa ' + restaurantName + ' har avbokats.';

      const html = '<html><body style="font-family:Arial,sans-serif;background:#f5f0e8;">'
        + '<div style="max-width:520px;margin:40px auto;background:white;border-radius:16px;overflow:hidden;">'
        + '<div style="background:#1a1208;padding:32px;text-align:center;"><div style="font-size:1.4rem;color:#c8973a;font-weight:bold;">MenuQR</div></div>'
        + '<div style="background:' + statusColor + ';padding:20px;text-align:center;"><div style="color:white;font-size:1rem;font-weight:600;">' + statusText + '</div></div>'
        + '<div style="padding:32px;">'
        + '<p style="color:#444;margin:0 0 20px;">Hej ' + name + '! ' + bodyText + '</p>'
        + '<table style="width:100%;border-collapse:collapse;background:#faf7f2;">'
        + '<tr><td style="padding:8px;color:#888;">Restaurang</td><td style="padding:8px;font-weight:600;">' + restaurantName + '</td></tr>'
        + '<tr style="border-top:1px solid #eee;"><td style="padding:8px;color:#888;">Datum</td><td style="padding:8px;font-weight:600;">' + dateFormatted + '</td></tr>'
        + '<tr style="border-top:1px solid #eee;"><td style="padding:8px;color:#888;">Tid</td><td style="padding:8px;font-weight:600;">' + time + '</td></tr>'
        + '<tr style="border-top:1px solid #eee;"><td style="padding:8px;color:#888;">Gaster</td><td style="padding:8px;font-weight:600;">' + guests + ' personer</td></tr>'
        + '</table>'
        + '</div>'
        + '<div style="background:#faf7f2;padding:16px;text-align:center;border-top:1px solid #eee;"><div style="font-size:0.72rem;color:#bbb;">Bokningssystem via MenuQR</div></div>'
        + '</div></body></html>';

      await sendEmail(email, subject, html);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Email error:', err.message);
    return res.status(500).json({ ok: false, error: err.message });
  }
};
