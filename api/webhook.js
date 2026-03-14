const crypto = require('crypto');

const SUPABASE_URL = 'https://bvqlgxkarepnpjzvpoqg.supabase.co';

function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifyStripeSignature(rawBody, sigHeader, secret) {
  const parts = sigHeader.split(',');
  let timestamp = '';
  const signatures = [];
  for (const part of parts) {
    const [key, val] = part.split('=');
    if (key === 't') timestamp = val;
    if (key === 'v1') signatures.push(val);
  }
  if (!timestamp || !signatures.length) return false;
  const signed = timestamp + '.' + rawBody.toString('utf8');
  const expected = crypto.createHmac('sha256', secret).update(signed).digest('hex');
  return signatures.some(function(sig) { return sig === expected; });
}

async function supabaseUpdate(table, update, match) {
  const col = Object.keys(match)[0];
  const val = match[col];
  const res = await fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + col + '=eq.' + val, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': process.env.SUPABASE_SERVICE_KEY,
      'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_KEY,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(update)
  });
  return res.ok;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let rawBody;
  try {
    rawBody = await getRawBody(req);
  } catch (err) {
    return res.status(400).json({ error: 'Could not read body' });
  }

  if (!verifyStripeSignature(rawBody, sig, webhookSecret)) {
    console.error('Invalid Stripe signature');
    return res.status(400).json({ error: 'Invalid signature' });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString('utf8'));
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  console.log('Webhook event:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const restaurantId = session.metadata && session.metadata.restaurant_id;
    const customerId = session.customer;
    if (restaurantId) {
      const ok = await supabaseUpdate('restaurants', {
        is_pro: true,
        pro_since: new Date().toISOString(),
        stripe_customer_id: customerId
      }, { id: restaurantId });
      console.log('Pro activated:', ok, 'for restaurant:', restaurantId);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = event.data.object.customer;
    const ok = await supabaseUpdate('restaurants', { is_pro: false }, { stripe_customer_id: customerId });
    console.log('Pro deactivated:', ok, 'for customer:', customerId);
  }

  return res.status(200).json({ received: true });
};

module.exports.config = { api: { bodyParser: false } };
