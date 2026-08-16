import { Request, Response } from 'express';
import { GOODIE_BOX_CURRENCY, GOODIE_BOX_LABEL, GOODIE_BOX_PRICE_CENTAVOS } from '../config/goodieBox';
import { env } from '../config/env';
import { HttpError } from '../middleware/errorHandler';
import { GoodieBoxOrder } from '../models/GoodieBoxOrder';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';
import { createCheckoutSession, PayMongoError } from '../utils/paymongo';

export const createGoodieBoxCheckout = asyncHandler(async (req: Request, res: Response) => {
  if (req.user!.role !== 'user') {
    throw new HttpError(403, 'Staff and admin accounts do not need to purchase the Goodie Box');
  }

  const { fullName, phone, address, deliveryNotes } = req.body as {
    fullName?: string;
    phone?: string;
    address?: string;
    deliveryNotes?: string;
  };
  if (!fullName?.trim() || !phone?.trim() || !address?.trim()) {
    throw new HttpError(400, 'fullName, phone, and address are required');
  }

  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }

  let session;
  try {
    session = await createCheckoutSession({
      lineItems: [
        {
          amount: GOODIE_BOX_PRICE_CENTAVOS,
          currency: GOODIE_BOX_CURRENCY,
          name: GOODIE_BOX_LABEL,
          quantity: 1,
        },
      ],
      paymentMethodTypes: ['card', 'gcash', 'qrph'],
      successUrl: `${env.clientUrl}/goodie-box?checkout=success`,
      cancelUrl: `${env.clientUrl}/goodie-box?checkout=cancelled`,
      description: GOODIE_BOX_LABEL,
      metadata: { userId: String(user._id) },
    });
  } catch (err) {
    if (err instanceof PayMongoError) {
      throw new HttpError(502, `PayMongo error: ${err.message}`);
    }
    throw err;
  }

  await GoodieBoxOrder.create({
    user: user._id,
    fullName: fullName.trim(),
    phone: phone.trim(),
    address: address.trim(),
    deliveryNotes: deliveryNotes?.trim() || '',
    amount: GOODIE_BOX_PRICE_CENTAVOS,
    currency: GOODIE_BOX_CURRENCY,
    checkoutSessionId: session.id,
    paymentStatus: 'pending',
    deliveryStatus: 'pending_delivery',
  });

  res.status(201).json({ checkoutUrl: session.attributes.checkout_url });
});

export const listMyGoodieBoxOrders = asyncHandler(async (req: Request, res: Response) => {
  const orders = await GoodieBoxOrder.find({ user: req.user!.id, paymentStatus: 'paid' })
    .select('-checkoutSessionId')
    .sort({ createdAt: -1 });
  res.json({ orders });
});
