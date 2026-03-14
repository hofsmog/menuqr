module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { customerId, restaurantId } = req.body;
  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

  try {
    // Hämta aktiva prenumerationer för kunden
    const subRes = await fetch(`https://api.stripe.com/v1/subscriptions?customer=${customerId}&status=active&limit=1`, {
      headers: { 'Authorization': `Bearer ${STRIPE_SECRET}` }
    });
    const subData = await subRes.json();
    const subscription = subData.data?.[0];
    if (!subscription) return res.status(200).json({ ok: true }); // redan avslutad

    // Avsluta vid periodens slut
    const cancelRes = await fetch(`https://api.stripe.com/v1/subscriptions/${subscription.id}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'cancel_at_period_end=true'
    });
    const cancelData = await cancelRes.json();
    if (!cancelRes.ok) throw new Error(cancelData.error?.message || 'Stripe error');

    return res.status(200).json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: err.message });
  }
}
