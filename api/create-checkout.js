module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, restaurantId } = req.body;
  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const PRICE_ID = 'price_1TAZb0H3mQ7LpxPls2Kv1WjU';

  if (!STRIPE_SECRET) {
    console.error('Create checkout misconfigured: missing STRIPE_SECRET_KEY');
    return res.status(500).json({ error: 'Checkout misconfigured' });
  }

  if (!restaurantId || typeof restaurantId !== 'string') {
    console.warn('Create checkout rejected: missing restaurantId');
    return res.status(400).json({ error: 'Missing required field: restaurantId' });
  }

  if (!email || typeof email !== 'string') {
    console.warn('Create checkout rejected: missing email');
    return res.status(400).json({ error: 'Missing required field: email' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRestaurantId = restaurantId.trim();
  if (!normalizedEmail) {
    console.warn('Create checkout rejected: empty email');
    return res.status(400).json({ error: 'Missing required field: email' });
  }
  if (!normalizedRestaurantId) {
    console.warn('Create checkout rejected: empty restaurantId');
    return res.status(400).json({ error: 'Missing required field: restaurantId' });
  }

  try {
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STRIPE_SECRET}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        'mode': 'subscription',
        'payment_method_types[]': 'card',
        'line_items[0][price]': PRICE_ID,
        'line_items[0][quantity]': '1',
        'customer_email': normalizedEmail,
        'metadata[restaurant_id]': normalizedRestaurantId,
        'success_url': `https://menuqr.se?pro_success=true&restaurant_id=${normalizedRestaurantId}`,
        'cancel_url': 'https://menuqr.se?pro_cancelled=true',
      })
    });

    const session = await response.json();
    if (!response.ok) throw new Error(session.error?.message || 'Stripe error');

    return res.status(200).json({ url: session.url });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
