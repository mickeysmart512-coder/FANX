import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY!;

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2024-11-20.acacia' as any,
  typescript: true,
});

/**
 * Creates a checkout session for purchasing FANX Coins.
 */
export async function createCoinCheckoutSession(
  userId: string,
  coinAmount: number,
  usdPrice: number,
  successUrl: string,
  cancelUrl: string
) {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${coinAmount} FANX Coins`,
            description: 'Fan currency for virtual gifting on FANX.',
          },
          unit_amount: Math.round(usdPrice * 100), // in cents
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId,
      coinAmount: coinAmount.toString(),
    },
  });

  return session;
}
