import { Request, Response } from 'express';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';
import { GoodieBoxOrder } from '../models/GoodieBoxOrder';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyWebhookSignature } from '../utils/paymongo';

export const handleGoodieBoxWebhook = asyncHandler(async (req: Request, res: Response) => {
  const signatureHeader = req.header('Paymongo-Signature');
  if (!signatureHeader) {
    throw new HttpError(400, 'Missing Paymongo-Signature header');
  }

  // req.body is the raw Buffer here — this route is mounted with express.raw() in app.ts
  // specifically so the exact bytes are available for HMAC verification.
  const rawBody = (req.body as Buffer).toString('utf8');

  let event;
  try {
    event = verifyWebhookSignature(rawBody, signatureHeader, env.paymongoGoodieBoxWebhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid signature';
    throw new HttpError(400, message);
  }

  const eventType = event.data.attributes.type;

  if (eventType === 'checkout_session.payment.paid') {
    const checkoutSession = event.data.attributes.data;
    const order = await GoodieBoxOrder.findOne({ checkoutSessionId: checkoutSession.id });

    if (order && order.paymentStatus !== 'paid') {
      order.paymentStatus = 'paid';
      await order.save();
    }
  }

  // Always 200 quickly so PayMongo doesn't retry unnecessarily once we've handled (or
  // deliberately ignored) the event.
  res.status(200).json({ received: true });
});
