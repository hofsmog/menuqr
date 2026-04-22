export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const { email, restaurantId } = await req.json();

  const STRIPE_SECRET = 'sk_test_51TA4h3QeEVmd8NvFC0cAdKVzOnfVX6v39PT7ZOg87ObnPL7Jg1s9oLdBb5kCnYipKQt3NpfGD81ina3S7mwQcMeq00ADeF8v91';
  const PRICE_ID = 'price_1TARzfQeEVmd8NvFbmEwuOiX';

  if (!STRIPE_SECRET) {
    console.error('Create checkout misconfigured: missing STRIPE_SECRET_KEY');
    return new Response(JSON.stringify({ error: 'Checkout misconfigured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!restaurantId || typeof restaurantId !== 'string') {
    console.warn('Create checkout rejected: missing restaurantId');
    return new Response(JSON.stringify({ error: 'Missing required field: restaurantId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!email || typeof email !== 'string') {
    console.warn('Create checkout rejected: missing email');
    return new Response(JSON.stringify({ error: 'Missing required field: email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedRestaurantId = restaurantId.trim();
  if (!normalizedEmail) {
    console.warn('Create checkout rejected: empty email');
    return new Response(JSON.stringify({ error: 'Missing required field: email' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  if (!normalizedRestaurantId) {
    console.warn('Create checkout rejected: empty restaurantId');
    return new Response(JSON.stringify({ error: 'Missing required field: restaurantId' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
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

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = { path: '/api/create-checkout' };
