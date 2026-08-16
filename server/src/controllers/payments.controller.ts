import { Request, Response } from 'express';
import {
  isPaidPlan,
  PLAN_LABELS,
  PLAN_PRICE_CENTAVOS,
  SUBSCRIPTION_PERIOD_DAYS,
} from '../config/plans';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';
import { Payment } from '../models/Payment';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { createCheckoutSession, PayMongoError, verifyWebhookSignature } from '../utils/paymongo';

export const createCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { plan } = req.body as { plan?: string };
  if (!plan || !isPaidPlan(plan)) {
    throw new HttpError(400, 'plan must be one of: starter, plus, premium');
  }

  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  const amount = PLAN_PRICE_CENTAVOS[plan];

  let session;
  try {
    session = await createCheckoutSession({
      lineItems: [
        {
          amount,
          currency: 'PHP',
          name: `${PLAN_LABELS[plan]} plan (${SUBSCRIPTION_PERIOD_DAYS} days)`,
          quantity: 1,
        },
      ],
      paymentMethodTypes: ['card', 'gcash', 'qrph'],
      successUrl: `${env.clientUrl}/subscription?checkout=success`,
      cancelUrl: `${env.clientUrl}/subscription?checkout=cancelled`,
      description: `Subscription upgrade to ${PLAN_LABELS[plan]}`,
      metadata: { userId: String(user._id), plan },
    });
  } catch (err) {
    if (err instanceof PayMongoError) {
      throw new HttpError(502, `PayMongo error: ${err.message}`);
    }
    throw err;
  }

  await Payment.create({
    user: user._id,
    plan,
    amount,
    currency: 'PHP',
    checkoutSessionId: session.id,
    status: 'pending',
  });

  res.status(201).json({ checkoutUrl: session.attributes.checkout_url });
});

export const handleWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signatureHeader = req.header('Paymongo-Signature');
  if (!signatureHeader) {
    throw new HttpError(400, 'Missing Paymongo-Signature header');
  }

  // req.body is the raw Buffer here — this route is mounted with express.raw() in app.ts
  // specifically so the exact bytes are available for HMAC verification.
  const rawBody = (req.body as Buffer).toString('utf8');

  let event;
  try {
    event = verifyWebhookSignature(rawBody, signatureHeader, env.paymongoWebhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    throw new HttpError(400, message);
  }

  const eventType = event.data.attributes.type;

  if (eventType === 'checkout_session.payment.paid') {
    const checkoutSession = event.data.attributes.data;
    const payment = await Payment.findOne({ checkoutSessionId: checkoutSession.id });

    if (payment && payment.status !== 'paid') {
      payment.status = 'paid';
      await payment.save();

      const periodEnd = new Date();
      periodEnd.setDate(periodEnd.getDate() + SUBSCRIPTION_PERIOD_DAYS);

      await User.updateOne(
        { _id: payment.user },
        {
          'subscription.plan': payment.plan,
          'subscription.status': 'active',
          'subscription.currentPeriodEnd': periodEnd,
        }
      );
    }
  }

  // Always 200 quickly so PayMongo doesn't retry unnecessarily once we've handled (or
  // deliberately ignored) the event.
  res.status(200).json({ received: true });
});
