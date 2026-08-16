import { IUser } from '../models/User';

// Lazily downgrades an expired paid subscription back to free. There's no cron job in this
// boilerplate — this runs wherever we fetch the current user (login, /auth/me), which is
// frequent enough to keep subscription state honest without extra infrastructure.
//
// Users on a PayMongo-driven recurring (auto-renew) subscription are exempt: their plan/status/
// currentPeriodEnd are kept honest in real time by the subscription webhook, not by this lazy
// check. Applying this check to them risks incorrectly free-tiering a still-paying customer if
// the cached currentPeriodEnd briefly lags a webhook delivery.
export async function ensureSubscriptionCurrent(user: IUser): Promise<void> {
  const { subscription } = user;
  if (subscription.paymongoSubscriptionId) {
    return;
  }
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
