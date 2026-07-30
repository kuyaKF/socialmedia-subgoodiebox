import crypto from 'node:crypto';
import { faker } from '@faker-js/faker';
import { connectDb } from '../db/connect';
import { PAID_PLANS, PLAN_PRICE_CENTAVOS, SUBSCRIPTION_PERIOD_DAYS } from '../config/plans';
import { Group } from '../models/Group';
import { Payment } from '../models/Payment';
import { SubscriptionPlan, User, UserRole } from '../models/User';
import mongoose from 'mongoose';

const TOTAL_USERS = 60;
const DEFAULT_PASSWORD = 'changeme123';
const GMAIL_SHARE = 0.4; // fraction of users given a @gmail.com address, for search-demo purposes
const OTHER_DOMAINS = ['yahoo.com', 'outlook.com', 'proton.me', 'company.io', 'work.co'];
const GROUP_NAMES = ['Engineering', 'Sales', 'Support', 'Marketing'];
const RENEWAL_PROBABILITY = 0.7; // chance a paid dummy user renews at each period boundary

function randomDateWithinDays(days: number): Date {
  const now = Date.now();
  const past = now - Math.random() * days * 24 * 60 * 60 * 1000;
  return new Date(past);
}

function randomRole(): UserRole {
  const roll = Math.random();
  if (roll < 0.15) return 'internal';
  return 'user';
}

function randomPlan(): SubscriptionPlan {
  return Math.random() < 0.4 ? faker.helpers.arrayElement(PAID_PLANS) : 'free';
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Simulates a plausible billing history for a paid dummy user: an initial payment shortly
// after they registered, then a chance of renewing at each ~30-day boundary up to today —
// some users churn partway through, leaving currentPeriodEnd in the past (needs renewal).
function generatePaymentHistory(
  registeredAt: Date,
  plan: (typeof PAID_PLANS)[number]
): { paymentDates: Date[]; currentPeriodEnd: Date } {
  const periodMs = SUBSCRIPTION_PERIOD_DAYS * DAY_MS;
  const now = Date.now();

  const firstPaymentDate = new Date(
    Math.min(registeredAt.getTime() + Math.random() * 14 * DAY_MS, now)
  );

  const paymentDates = [firstPaymentDate];
  let currentPeriodEnd = new Date(firstPaymentDate.getTime() + periodMs);

  while (currentPeriodEnd.getTime() < now) {
    if (Math.random() > RENEWAL_PROBABILITY) break; // churned — stop renewing
    const jitterDays = Math.random() * 5 - 2; // renew a few days early or late
    const renewalDate = new Date(currentPeriodEnd.getTime() + jitterDays * DAY_MS);
    paymentDates.push(renewalDate);
    currentPeriodEnd = new Date(renewalDate.getTime() + periodMs);
  }

  return { paymentDates, currentPeriodEnd };
}

async function createDummyUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const name = `${firstName} ${lastName}`;
  const domain = Math.random() < GMAIL_SHARE ? 'gmail.com' : faker.helpers.arrayElement(OTHER_DOMAINS);
  const email = faker.internet
    .email({ firstName, lastName, provider: domain })
    .toLowerCase();

  const registeredAt = randomDateWithinDays(180);
  const plan = randomPlan();

  try {
    const user = await User.create({
      email,
      passwordHash: DEFAULT_PASSWORD,
      name,
      role: randomRole(),
      subscription: {
        plan,
        status: Math.random() < 0.1 ? 'inactive' : 'active',
      },
    });

    if (plan !== 'free') {
      const { paymentDates, currentPeriodEnd } = generatePaymentHistory(registeredAt, plan);
      // Bypass the timestamps hooks so we can backdate registration and billing history.
      await User.collection.updateOne(
        { _id: user._id },
        { $set: { createdAt: registeredAt, 'subscription.currentPeriodEnd': currentPeriodEnd } }
      );
      await Payment.collection.insertMany(
        paymentDates.map((date) => ({
          user: user._id,
          plan,
          amount: PLAN_PRICE_CENTAVOS[plan],
          currency: 'PHP',
          checkoutSessionId: `dummy_${crypto.randomUUID()}`,
          status: 'paid',
          createdAt: date,
          updatedAt: date,
        }))
      );
    } else {
      await User.collection.updateOne({ _id: user._id }, { $set: { createdAt: registeredAt } });
    }

    return user;
  } catch (err) {
    if (err instanceof Error && 'code' in err && (err as { code?: number }).code === 11000) {
      return null; // email collision with an existing user — skip
    }
    throw err;
  }
}

async function main() {
  await connectDb();

  console.log(`[seed:dummy] creating up to ${TOTAL_USERS} dummy users...`);
  const created = [];
  for (let i = 0; i < TOTAL_USERS; i++) {
    const user = await createDummyUser();
    if (user) created.push(user);
  }
  console.log(`[seed:dummy] created ${created.length} users (skipped duplicates)`);

  const internalUsers = created.filter((u) => u.role === 'internal');
  const regularUsers = created.filter((u) => u.role === 'user');

  let groupIndex = 0;
  let memberCursor = 0;
  for (const leader of internalUsers) {
    if (groupIndex >= GROUP_NAMES.length) break;
    const groupName = GROUP_NAMES[groupIndex];
    const existing = await Group.findOne({ name: groupName });
    if (existing) {
      groupIndex++;
      continue;
    }

    const memberCount = faker.number.int({ min: 3, max: 6 });
    const members = regularUsers.slice(memberCursor, memberCursor + memberCount);
    memberCursor += memberCount;

    const group = await Group.create({
      name: groupName,
      leader: leader._id,
      members: members.map((m) => m._id),
    });

    await User.updateOne({ _id: leader._id }, { group: group._id });
    await User.updateMany({ _id: { $in: members.map((m) => m._id) } }, { group: group._id });

    console.log(`[seed:dummy] created group "${groupName}" with leader ${leader.name} and ${members.length} members`);
    groupIndex++;
  }

  console.log(`[seed:dummy] done. All dummy accounts use the password: ${DEFAULT_PASSWORD}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[seed:dummy] failed', err);
  process.exit(1);
});
