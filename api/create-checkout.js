export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, restaurantId } = req.body;
  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
  const PRICE_ID = 'price_1TARzfQeEVmd8NvFbmEwuOiX';

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
        'customer_email': email,
        'metadata[restaurant_id]': restaurantId,
        'success_url': `https://menuqr.se?pro_success=true&restaurant_id=${restaurantId}`,
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
