import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getAdminStatsRequest } from '../api/adminStats.api'
import type { AdminStats } from '../types/models'

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8',
  starter: '#60a5fa',
  plus: '#818cf8',
  premium: '#f59e0b',
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'short',
    year: '2-digit',
  })
}

function formatCurrency(amount: number): string {
  return `₱${amount.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 p-4">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  )
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminStatsRequest()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="mt-10 text-center text-slate-500">Loading...</div>
  if (!stats) return <div className="mt-10 text-center text-slate-500">Could not load stats.</div>

  const revenueData = stats.revenueByMonth.map((r) => ({ ...r, label: formatMonthLabel(r.month) }))
  const signupData = stats.signupsByMonth.map((s) => ({ ...s, label: formatMonthLabel(s.month) }))
  const subscriptionActivityData = stats.newSubscriptionsByMonth.map((n, i) => ({
    label: formatMonthLabel(n.month),
    new: n.count,
    renewal: stats.renewalsByMonth[i]?.count || 0,
  }))
  const planData = stats.planDistribution.map((p) => ({
    ...p,
    label: p.plan[0].toUpperCase() + p.plan.slice(1),
  }))

  return (
    <div className="mx-auto mt-10 max-w-6xl px-4">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Total users" value={stats.totalUsers.toLocaleString()} />
        <StatCard label="Total groups" value={stats.totalGroups.toLocaleString()} />
        <StatCard label="Free users" value={stats.freeUsers.toLocaleString()} />
        <StatCard label="Paid users" value={stats.paidUsers.toLocaleString()} />
        <StatCard label="Total revenue" value={formatCurrency(stats.totalRevenue)} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-4">
          <h2 className="mb-4 text-sm font-medium text-slate-500">Revenue per month</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₱${v}`} />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <h2 className="mb-4 text-sm font-medium text-slate-500">New signups per month</h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={signupData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium text-slate-500">
            New subscriptions vs. renewals
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={subscriptionActivityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar name="New" dataKey="new" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              <Bar name="Renewal" dataKey="renewal" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 p-4 lg:col-span-2">
          <h2 className="mb-4 text-sm font-medium text-slate-500">Plan distribution</h2>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <ResponsiveContainer width="100%" height={240} className="sm:w-1/2">
              <PieChart>
                <Pie
                  data={planData}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                >
                  {planData.map((entry) => (
                    <Cell key={entry.plan} fill={PLAN_COLORS[entry.plan]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <ul className="space-y-2 text-sm">
              {planData.map((p) => (
                <li key={p.plan} className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: PLAN_COLORS[p.plan] }}
                  />
                  <span className="text-slate-700">{p.label}</span>
                  <span className="text-slate-400">— {p.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
