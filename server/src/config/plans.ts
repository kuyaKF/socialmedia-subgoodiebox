import { SubscriptionPlan } from '../models/User';

export type PaidPlan = Exclude<SubscriptionPlan, 'free'>;

export const PAID_PLANS: PaidPlan[] = ['starter', 'plus', 'premium'];

// Placeholder PHP pricing (in centavos, PayMongo's smallest currency unit) — adjust to your
// actual pricing. Ratios roughly match the landing page's illustrative $9/$19/$39 tiers.
export const PLAN_PRICE_CENTAVOS: Record<PaidPlan, number> = {
  starter: 49900, // ₱499.00
  plus: 99900, // ₱999.00
  premium: 199900, // ₱1,999.00
};

export const PLAN_LABELS: Record<PaidPlan, string> = {
  starter: 'Starter',
  plus: 'Plus',
  premium: 'Premium',
};

export const SUBSCRIPTION_PERIOD_DAYS = 30;

export function isPaidPlan(value: string): value is PaidPlan {
  return (PAID_PLANS as string[]).includes(value);
}
