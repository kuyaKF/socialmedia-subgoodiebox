import { Request, Response } from 'express';
import { HttpError } from '../middleware/errorHandler';
import { NewsletterSubscriber } from '../models/NewsletterSubscriber';
import { asyncHandler } from '../utils/asyncHandler';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const subscribe = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string };
  if (!email || !EMAIL_RE.test(email)) {
    throw new HttpError(400, 'A valid email is required');
  }

  const normalized = email.toLowerCase().trim();
  try {
    await NewsletterSubscriber.create({ email: normalized });
    res.status(201).json({ message: "You're subscribed!" });
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as { code?: number }).code === 11000) {
      // Already on the list — treat as success rather than an error.
      res.status(200).json({ message: "You're already subscribed!" });
      return;
    }
    throw err;
  }
});
