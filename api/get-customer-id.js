module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'No email' });

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

  try {
    const response = await fetch('https://api.stripe.com/v1/customers?email=' + encodeURIComponent(email) + '&limit=1', {
      headers: { 'Authorization': 'Bearer ' + STRIPE_SECRET }
    });
    const data = await response.json();
    const customerId = data.data?.[0]?.id || null;
    return res.status(200).json({ customerId });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
