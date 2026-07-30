import { Request, Response } from 'express';
import { SubscriptionPlan, User } from '../models/User';
import { Group } from '../models/Group';
import { Payment } from '../models/Payment';
import { asyncHandler } from '../utils/asyncHandler';

const MONTHS_OF_HISTORY = 12;
const ALL_PLANS: SubscriptionPlan[] = ['free', 'starter', 'plus', 'premium'];

function lastNMonthKeys(n: number): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

function monthKeyOf(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export const getAdminStats = asyncHandler(async (_req: Request, res: Response) => {
  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - (MONTHS_OF_HISTORY - 1));
  monthsAgo.setDate(1);
  monthsAgo.setHours(0, 0, 0, 0);

  const [totalUsers, totalGroups, planCounts, revenueRows, signupRows, totalRevenueRows, allPaidPayments] =
    await Promise.all([
      User.countDocuments(),
      Group.countDocuments(),
      User.aggregate([{ $group: { _id: '$subscription.plan', count: { $sum: 1 } } }]),
      Payment.aggregate([
        { $match: { status: 'paid', createdAt: { $gte: monthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
          },
        },
      ]),
      User.aggregate([
        { $match: { createdAt: { $gte: monthsAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            count: { $sum: 1 },
          },
        },
      ]),
      Payment.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      // Fetched in full (not windowed) so a user's very first payment — even if it happened
      // before the chart window — is still correctly excluded from "renewals".
      Payment.find({ status: 'paid' }).select('user createdAt').sort({ user: 1, createdAt: 1 }).lean(),
    ]);

  const planCountMap = new Map<string, number>(planCounts.map((p) => [p._id, p.count]));
  const planDistribution = ALL_PLANS.map((plan) => ({
    plan,
    count: planCountMap.get(plan) || 0,
  }));
  const freeUsers = planCountMap.get('free') || 0;
  const paidUsers = totalUsers - freeUsers;

  const monthKeys = lastNMonthKeys(MONTHS_OF_HISTORY);
  const revenueMap = new Map<string, number>(revenueRows.map((r) => [r._id, r.revenue]));
  const signupMap = new Map<string, number>(signupRows.map((r) => [r._id, r.count]));

  const revenueByMonth = monthKeys.map((month) => ({
    month,
    revenue: (revenueMap.get(month) || 0) / 100,
  }));
  const signupsByMonth = monthKeys.map((month) => ({
    month,
    count: signupMap.get(month) || 0,
  }));

  const monthKeySet = new Set(monthKeys);
  const seenUsers = new Set<string>();
  const newSubMap = new Map<string, number>();
  const renewalMap = new Map<string, number>();
  for (const payment of allPaidPayments) {
    const userId = String(payment.user);
    const isNewSubscription = !seenUsers.has(userId);
    seenUsers.add(userId);

    const monthKey = monthKeyOf(payment.createdAt);
    if (!monthKeySet.has(monthKey)) continue;
    const map = isNewSubscription ? newSubMap : renewalMap;
    map.set(monthKey, (map.get(monthKey) || 0) + 1);
  }
  const newSubscriptionsByMonth = monthKeys.map((month) => ({
    month,
    count: newSubMap.get(month) || 0,
  }));
  const renewalsByMonth = monthKeys.map((month) => ({
    month,
    count: renewalMap.get(month) || 0,
  }));

  res.json({
    totalUsers,
    totalGroups,
    freeUsers,
    paidUsers,
    totalRevenue: (totalRevenueRows[0]?.total || 0) / 100,
    planDistribution,
    revenueByMonth,
    signupsByMonth,
    newSubscriptionsByMonth,
    renewalsByMonth,
  });
});
