import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const supabase = createClient(
  'https://bvqlgxkarepnpjzvpoqg.supabase.co',
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const restaurantId = session.metadata?.restaurant_id;
    const customerId = session.customer;

    if (restaurantId) {
      const { error } = await supabase
        .from('restaurants')
        .update({
          is_pro: true,
          pro_since: new Date().toISOString(),
          stripe_customer_id: customerId
        })
        .eq('id', restaurantId);

      if (error) console.error('Supabase update error:', error);
      else console.log('Pro activated for restaurant:', restaurantId);
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    const customerId = subscription.customer;

    const { error } = await supabase
      .from('restaurants')
      .update({ is_pro: false })
      .eq('stripe_customer_id', customerId);

    if (error) console.error('Supabase update error:', error);
    else console.log('Pro deactivated for customer:', customerId);
  }

  res.status(200).json({ received: true });
}

export const config = {
  api: { bodyParser: false }
};
