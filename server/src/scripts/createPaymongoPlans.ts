// One-off script: creates the three PayMongo Plan resources (Starter/Plus/Premium) needed for
// recurring billing. Run once via `npx ts-node src/scripts/createPaymongoPlans.ts` from `server/`,
// then paste the printed ids into PAYMONGO_PLAN_ID_STARTER/PLUS/PREMIUM in .env and delete this
// file. Talks to the PayMongo API only — no DB connection needed.
//
// Prerequisite: PayMongo support must have enabled Subscriptions on this account first (it is not
// self-serve/on-by-default) — running this before that will fail.
import { PAID_PLANS, PLAN_LABELS, PLAN_PRICE_CENTAVOS } from '../config/plans';
import { createPlan } from '../utils/paymongo';

async function main() {
  for (const plan of PAID_PLANS) {
    const resource = await createPlan({
      name: `${PLAN_LABELS[plan]} plan`,
      description: `Haven Circle ${PLAN_LABELS[plan]} monthly membership`,
      amount: PLAN_PRICE_CENTAVOS[plan],
      currency: 'PHP',
      interval: 'monthly',
      intervalCount: 1,
      planType: 'scheduled',
    });
    console.log(`${plan}: ${resource.id}`);
  }
  process.exit(0);
}

main().catch((err) => {
  console.error('[createPaymongoPlans] failed', err);
  process.exit(1);
});
