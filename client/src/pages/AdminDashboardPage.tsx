import { useEffect, useState, type ReactNode } from 'react'
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
import type { AdminStats, GoodieBoxDeliveryStatus } from '../types/models'

const PLAN_COLORS: Record<string, string> = {
  free: '#94a3b8',
  starter: '#60a5fa',
  plus: '#818cf8',
  premium: '#f59e0b',
}

const DELIVERY_STATUS_COLORS: Record<GoodieBoxDeliveryStatus, string> = {
  pending_delivery: '#f59e0b',
  in_progress: '#0ea5e9',
  complete: '#10b981',
}

const DELIVERY_STATUS_LABELS: Record<GoodieBoxDeliveryStatus, string> = {
  pending_delivery: 'Pending delivery',
  in_progress: 'In progress',
  complete: 'Complete',
}

function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString(undefined, { month: 'short' })
}

function formatDayLabel(dayKey: string): string {
  const day = Number(dayKey.split('-')[2])
  return String(day)
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

function ChartCard({
  title,
  className = '',
  children,
}: {
  title: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={`rounded-xl border border-slate-200 p-4 ${className}`}>
      <h2 className="mb-4 text-sm font-medium text-slate-500">{title}</h2>
      {children}
    </div>
  )
}

const TABS = [
  { id: 'signups', label: 'Signups' },
  { id: 'goodieBox', label: 'Goodie Box' },
] as const
type TabId = (typeof TABS)[number]['id']

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabId>('signups')

  useEffect(() => {
    getAdminStatsRequest()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="mt-10 text-center text-slate-500">Loading...</div>
  if (!stats) return <div className="mt-10 text-center text-slate-500">Could not load stats.</div>

  const revenueData = stats.revenueByMonth.map((r) => ({ ...r, label: formatMonthLabel(r.month) }))
  const paymentsByPlanData = stats.paymentsByPlanPerMonth.map((p) => ({
    ...p,
    label: formatMonthLabel(p.month),
  }))
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
  const revenueByDayData = stats.revenueByDay.map((r) => ({ ...r, label: formatDayLabel(r.day) }))
  const signupsByDayData = stats.signupsByDay.map((s) => ({ ...s, label: formatDayLabel(s.day) }))
  const currentMonthLabel = new Date().toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

  const goodieBoxRevenueData = stats.goodieBoxRevenueByMonth.map((r) => ({
    ...r,
    label: formatMonthLabel(r.month),
  }))
  const goodieBoxOrdersData = stats.goodieBoxOrdersByMonth.map((o) => ({
    ...o,
    label: formatMonthLabel(o.month),
  }))
  const goodieBoxStatusData = stats.goodieBoxOrdersByDeliveryStatus.map((s) => ({
    ...s,
    label: DELIVERY_STATUS_LABELS[s.status],
  }))

  return (
    <div className="mx-auto mt-10 max-w-6xl px-4 pb-16">
      <h1 className="mb-6 text-2xl font-semibold text-slate-900">Dashboard</h1>

      <div className="mb-8 flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'signups' && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <StatCard label="Total users" value={stats.totalUsers.toLocaleString()} />
            <StatCard label="Total groups" value={stats.totalGroups.toLocaleString()} />
            <StatCard label="Free users" value={stats.freeUsers.toLocaleString()} />
            <StatCard label="Paid users" value={stats.paidUsers.toLocaleString()} />
            <StatCard
              label="Current month revenue"
              value={formatCurrency(stats.currentMonthRevenue)}
            />
            <StatCard label="Total revenue" value={formatCurrency(stats.totalRevenue)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Revenue per month">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₱${v}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="New signups per month">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={`Revenue per day · ${currentMonthLabel}`}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={revenueByDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₱${v}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title={`New signups per day · ${currentMonthLabel}`}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={signupsByDayData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="New subscriptions vs. renewals">
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
            </ChartCard>

            <ChartCard title="Payments by plan per month">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={paymentsByPlanData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar name="Starter" dataKey="starter" stackId="plan" fill={PLAN_COLORS.starter} />
                  <Bar name="Plus" dataKey="plus" stackId="plan" fill={PLAN_COLORS.plus} />
                  <Bar
                    name="Premium"
                    dataKey="premium"
                    stackId="plan"
                    fill={PLAN_COLORS.premium}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Plan distribution" className="lg:col-span-2">
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
            </ChartCard>
          </div>
        </>
      )}

      {activeTab === 'goodieBox' && (
        <>
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard label="Total orders" value={stats.totalGoodieBoxOrders.toLocaleString()} />
            <StatCard
              label="Current month revenue"
              value={formatCurrency(stats.currentMonthGoodieBoxRevenue)}
            />
            <StatCard label="Total revenue" value={formatCurrency(stats.totalGoodieBoxRevenue)} />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Goodie Box revenue per month">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={goodieBoxRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₱${v}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="#0f172a" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Goodie Box orders per month">
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={goodieBoxOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Orders by delivery status" className="lg:col-span-2">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <ResponsiveContainer width="100%" height={240} className="sm:w-1/2">
                  <PieChart>
                    <Pie
                      data={goodieBoxStatusData}
                      dataKey="count"
                      nameKey="label"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                    >
                      {goodieBoxStatusData.map((entry) => (
                        <Cell key={entry.status} fill={DELIVERY_STATUS_COLORS[entry.status]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <ul className="space-y-2 text-sm">
                  {goodieBoxStatusData.map((s) => (
                    <li key={s.status} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: DELIVERY_STATUS_COLORS[s.status] }}
                      />
                      <span className="text-slate-700">{s.label}</span>
                      <span className="text-slate-400">— {s.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ChartCard>
          </div>
        </>
      )}
    </div>
  )
}
