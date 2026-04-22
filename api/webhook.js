const Stripe = require('stripe');

const SUPABASE_URL = 'https://bvqlgxkarepnpjzvpoqg.supabase.co';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16'
});

async function supabaseUpdate(table, update, match) {
  const col = Object.keys(match)[0];
  const val = match[col];
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + col + '=eq.' + encodeURIComponent(val), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(update)
  });
  console.log('Supabase update status:', res.status, 'table:', table, 'matchColumn:', col);
  return res.ok;
}

async function readRawBody(req) {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  if (req.body && typeof req.body === 'object') return Buffer.from(JSON.stringify(req.body));

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('Stripe webhook misconfigured: missing STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET');
    return res.status(500).json({ error: 'Webhook misconfigured' });
  }

  const signature = req.headers['stripe-signature'];
  if (!signature) {
    console.warn('Stripe webhook rejected: missing signature header');
    return res.status(400).json({ error: 'Missing Stripe signature' });
  }

  let event;
  try {
    const rawBody = await readRawBody(req);
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.warn('Stripe webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid Stripe signature' });
  }

  console.log('Stripe webhook event received:', event.type, 'id:', event.id);

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const restaurantId = session.metadata && session.metadata.restaurant_id;
      const customerId = session.customer;
      console.log('checkout.session.completed for restaurant:', restaurantId || 'missing', 'customer:', customerId || 'missing');

      if (restaurantId) {
        const ok = await supabaseUpdate('restaurants', {
          is_pro: true,
          pro_since: new Date().toISOString(),
          stripe_customer_id: customerId
        }, { id: restaurantId });
        console.log('Pro activated:', ok);
      } else {
        console.warn('checkout.session.completed missing restaurant_id metadata');
      }
    } else if (event.type === 'customer.subscription.deleted') {
      const customerId = event.data.object.customer;
      console.log('customer.subscription.deleted for customer:', customerId || 'missing');

      if (customerId) {
        const ok = await supabaseUpdate('restaurants', { is_pro: false }, { stripe_customer_id: customerId });
        console.log('Pro deactivated:', ok);
      } else {
        console.warn('customer.subscription.deleted missing customer id');
      }
    } else {
      console.log('Stripe webhook event ignored:', event.type);
    }

    return res.status(200).json({ received: true });
  } catch (err) {
    console.error('Stripe webhook handler failed for event', event.id, event.type, err.message);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};
