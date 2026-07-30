import { IUser } from '../models/User';

// Lazily downgrades an expired paid subscription back to free. There's no cron job in this
// boilerplate — this runs wherever we fetch the current user (login, /auth/me), which is
// frequent enough to keep subscription state honest without extra infrastructure.
export async function ensureSubscriptionCurrent(user: IUser): Promise<void> {
  const { subscription } = user;
  if (
    subscription.plan !== 'free' &&
    subscription.currentPeriodEnd &&
    subscription.currentPeriodEnd.getTime() < Date.now()
  ) {
    subscription.plan = 'free';
    subscription.status = 'active';
    subscription.currentPeriodEnd = null;
    await user.save();
  }
}
