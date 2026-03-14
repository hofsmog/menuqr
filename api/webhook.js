import crypto from 'crypto';

const SUPABASE_URL = 'https://bvqlgxkarepnpjzvpoqg.supabase.co';

function verifyStripeSignature(payload, sigHeader, secret) {
  const parts = sigHeader.split(',');
  let timestamp = '';
  const signatures = [];
  for (const part of parts) {
    const [key, val] = part.split('=');
    if (key === 't') timestamp = val;
    if (key === 'v1') signatures.push(val);
  }
  if (!timestamp || !signatures.length) return false;
  const signed = `${timestamp}.${payload}`;
  const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  return signatures.some(sig => sig === expected);
}

async function supabaseUpdate(table, update, match) {
  const col = Object.keys(match)[0];
  const val = match[col];
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${val}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(update)
  });
  return res.ok;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const rawBody = Buffer.concat(chunks).toString('utf8');

  if (!verifyStripeSignature(rawBody, sig, webhookSecret)) {
    return res.status(400).json({ error: 'Invalid signature' });
  }

  const event = JSON.parse(rawBody);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const restaurantId = session.metadata?.restaurant_id;
    const customerId = session.customer;
    if (restaurantId) {
      await supabaseUpdate('restaurants', {
        is_pro: true,
        pro_since: new Date().toISOString(),
        stripe_customer_id: customerId
      }, { id: restaurantId });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = event.data.object.customer;
    await supabaseUpdate('restaurants', { is_pro: false }, { stripe_customer_id: customerId });
  }

  res.status(200).json({ received: true });
}

export const config = {
  api: { bodyParser: false }
};
