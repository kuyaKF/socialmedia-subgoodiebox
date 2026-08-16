import { env } from './env';
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

// PayMongo Plan resource ids for recurring billing — populated once via
// `npx ts-node src/scripts/createPaymongoPlans.ts` and pasted into .env. Optional at boot since
// Subscriptions must first be enabled on the PayMongo account before these can exist.
export const PAYMONGO_PLAN_IDS: Partial<Record<PaidPlan, string>> = {
  starter: env.paymongoPlanIdStarter,
  plus: env.paymongoPlanIdPlus,
  premium: env.paymongoPlanIdPremium,
};

export function paymongoPlanIdFor(plan: PaidPlan): string {
  const planId = PAYMONGO_PLAN_IDS[plan];
  if (!planId) {
    throw new Error(
      `No PayMongo Plan id configured for "${plan}" — run src/scripts/createPaymongoPlans.ts and set PAYMONGO_PLAN_ID_${plan.toUpperCase()} in .env`
    );
  }
  return planId;
}
