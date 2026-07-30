import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { User } from '../models/User';
import { asyncHandler } from '../utils/asyncHandler';

export const getMySubscription = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  res.json({ subscription: user.subscription });
});

// Self-service cancellation only — upgrading to a paid plan must go through
// POST /api/payments/create-checkout so it's backed by an actual payment.
export const cancelMySubscription = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.user!.id);
  if (!user) {
    throw new HttpError(404, 'User not found');
  }
  user.subscription.plan = 'free';
  user.subscription.status = 'active';
  user.subscription.currentPeriodEnd = null;
  await user.save();
  res.json({ subscription: user.subscription });
});
