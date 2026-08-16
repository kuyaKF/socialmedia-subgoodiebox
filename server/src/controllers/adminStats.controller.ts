import { Request, Response } from 'express';
import { PAID_PLANS, PaidPlan } from '../config/plans';
import { SubscriptionPlan, User } from '../models/User';
import { Group } from '../models/Group';
import { GoodieBoxDeliveryStatus, GoodieBoxOrder } from '../models/GoodieBoxOrder';
import { Payment } from '../models/Payment';
import { asyncHandler } from '../utils/asyncHandler';

const MONTHS_OF_HISTORY = 12;
const ALL_PLANS: SubscriptionPlan[] = ['free', 'starter', 'plus', 'premium'];
const ALL_DELIVERY_STATUSES: GoodieBoxDeliveryStatus[] = [
  'pending_delivery',
  'in_progress',
  'complete',
];

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

// Every day from the 1st of the current month through today — no future days, since they can't
// have data yet.
function daysSoFarThisMonth(): string[] {
  const now = new Date();
  const keys: string[] = [];
  for (let day = 1; day <= now.getDate(); day++) {
    const d = new Date(now.getFullYear(), now.getMonth(), day);
    keys.push(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
    );
  }
  return keys;
}

export const getAdminStats = asyncHandler(async (_req: Request, res: Response) => {
  const monthsAgo = new Date();
  monthsAgo.setMonth(monthsAgo.getMonth() - (MONTHS_OF_HISTORY - 1));
  monthsAgo.setDate(1);
  monthsAgo.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalGroups,
    planCounts,
    revenueRows,
    paymentsByPlanRows,
    signupRows,
    totalRevenueRows,
    allPaidPayments,
    revenueByDayRows,
    signupsByDayRows,
    goodieBoxRevenueRows,
    goodieBoxOrdersRows,
    totalGoodieBoxRevenueRows,
    totalGoodieBoxOrders,
    goodieBoxByDeliveryStatusRows,
    goodieBoxRevenueByDayRows,
  ] = await Promise.all([
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
    Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: monthsAgo } } },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            plan: '$plan',
          },
          count: { $sum: 1 },
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
    Payment.aggregate([
      { $match: { status: 'paid', createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
        },
      },
    ]),
    User.aggregate([
      { $match: { createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    GoodieBoxOrder.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: monthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
        },
      },
    ]),
    GoodieBoxOrder.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: monthsAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
    ]),
    GoodieBoxOrder.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    GoodieBoxOrder.countDocuments({ paymentStatus: 'paid' }),
    GoodieBoxOrder.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: '$deliveryStatus', count: { $sum: 1 } } },
    ]),
    GoodieBoxOrder.aggregate([
      { $match: { paymentStatus: 'paid', createdAt: { $gte: startOfMonth } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$amount' },
        },
      },
    ]),
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

  const paymentsByPlanMap = new Map<string, Record<string, number>>();
  for (const row of paymentsByPlanRows) {
    const { month, plan } = row._id as { month: string; plan: string };
    const forMonth = paymentsByPlanMap.get(month) ?? {};
    forMonth[plan] = row.count;
    paymentsByPlanMap.set(month, forMonth);
  }
  const paymentsByPlanPerMonth = monthKeys.map((month) => {
    const forMonth = paymentsByPlanMap.get(month) ?? {};
    return {
      month,
      ...Object.fromEntries(PAID_PLANS.map((plan) => [plan, forMonth[plan] || 0])),
    } as { month: string } & Record<PaidPlan, number>;
  });
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

  const dayKeys = daysSoFarThisMonth();
  const revenueByDayMap = new Map<string, number>(revenueByDayRows.map((r) => [r._id, r.revenue]));
  const signupsByDayMap = new Map<string, number>(signupsByDayRows.map((r) => [r._id, r.count]));
  const revenueByDay = dayKeys.map((day) => ({
    day,
    revenue: (revenueByDayMap.get(day) || 0) / 100,
  }));
  const signupsByDay = dayKeys.map((day) => ({
    day,
    count: signupsByDayMap.get(day) || 0,
  }));
  const currentMonthRevenue = revenueByDay.reduce((sum, r) => sum + r.revenue, 0);

  const goodieBoxRevenueMap = new Map<string, number>(
    goodieBoxRevenueRows.map((r) => [r._id, r.revenue])
  );
  const goodieBoxOrdersMap = new Map<string, number>(
    goodieBoxOrdersRows.map((r) => [r._id, r.count])
  );
  const goodieBoxRevenueByMonth = monthKeys.map((month) => ({
    month,
    revenue: (goodieBoxRevenueMap.get(month) || 0) / 100,
  }));
  const goodieBoxOrdersByMonth = monthKeys.map((month) => ({
    month,
    count: goodieBoxOrdersMap.get(month) || 0,
  }));

  const goodieBoxStatusCountMap = new Map<string, number>(
    goodieBoxByDeliveryStatusRows.map((r) => [r._id, r.count])
  );
  const goodieBoxOrdersByDeliveryStatus = ALL_DELIVERY_STATUSES.map((status) => ({
    status,
    count: goodieBoxStatusCountMap.get(status) || 0,
  }));

  const goodieBoxRevenueByDayMap = new Map<string, number>(
    goodieBoxRevenueByDayRows.map((r) => [r._id, r.revenue])
  );
  const goodieBoxRevenueByDay = dayKeys.map((day) => ({
    day,
    revenue: (goodieBoxRevenueByDayMap.get(day) || 0) / 100,
  }));
  const currentMonthGoodieBoxRevenue = goodieBoxRevenueByDay.reduce(
    (sum, r) => sum + r.revenue,
    0
  );

  res.json({
    totalUsers,
    totalGroups,
    freeUsers,
    paidUsers,
    currentMonthRevenue,
    totalRevenue: (totalRevenueRows[0]?.total || 0) / 100,
    planDistribution,
    revenueByMonth,
    paymentsByPlanPerMonth,
    signupsByMonth,
    newSubscriptionsByMonth,
    renewalsByMonth,
    revenueByDay,
    signupsByDay,
    totalGoodieBoxOrders,
    totalGoodieBoxRevenue: (totalGoodieBoxRevenueRows[0]?.total || 0) / 100,
    currentMonthGoodieBoxRevenue,
    goodieBoxRevenueByMonth,
    goodieBoxOrdersByMonth,
    goodieBoxOrdersByDeliveryStatus,
    goodieBoxRevenueByDay,
  });
});
