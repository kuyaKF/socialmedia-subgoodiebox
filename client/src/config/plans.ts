import type { PaidSubscriptionPlan } from '../types/models'

// Must match server/src/config/plans.ts (PLAN_PRICE_CENTAVOS) — no public pricing endpoint yet,
// so keep these in sync by hand if you change the server-side amounts.

export const PAID_PLAN_IDS: PaidSubscriptionPlan[] = ['starter', 'plus', 'premium']

export const PLAN_LABELS: Record<PaidSubscriptionPlan, string> = {
  starter: 'Starter',
  plus: 'Plus',
  premium: 'Premium',
}

export const PLAN_PRICE_LABELS: Record<PaidSubscriptionPlan, string> = {
  starter: '₱499',
  plus: '₱999',
  premium: '₱1,999',
}
