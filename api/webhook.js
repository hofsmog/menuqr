const SUPABASE_URL = 'https://bvqlgxkarepnpjzvpoqg.supabase.co';

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
  console.log('Supabase update status:', res.status);
  return res.ok;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let event;
  try {
    event = req.body;
    if (typeof event === 'string') event = JSON.parse(event);
  } catch (err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }

  console.log('Webhook event received:', event && event.type);

  if (!event || !event.type) {
    return res.status(400).json({ error: 'No event type' });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const restaurantId = session.metadata && session.metadata.restaurant_id;
    const customerId = session.customer;
    console.log('checkout.session.completed - restaurantId:', restaurantId, 'customerId:', customerId);
    if (restaurantId) {
      const ok = await supabaseUpdate('restaurants', {
        is_pro: true,
        pro_since: new Date().toISOString(),
        stripe_customer_id: customerId
      }, { id: restaurantId });
      console.log('Pro activated:', ok);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = event.data.object.customer;
    console.log('subscription.deleted - customerId:', customerId);
    const ok = await supabaseUpdate('restaurants', { is_pro: false }, { stripe_customer_id: customerId });
    console.log('Pro deactivated:', ok);
  }

  return res.status(200).json({ received: true });
};
