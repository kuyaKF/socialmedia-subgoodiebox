import { useEffect, useState, type ReactNode } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getAdminStatsRequest } from '../api/adminStats.api'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { ChartContainer, type ChartConfig } from '../components/ui/chart'
import { Skeleton } from '../components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { DELIVERY_STATUS_COLORS, DELIVERY_STATUS_LABELS, PLAN_COLORS } from '../components/admin/chartColors'
import type { AdminStats } from '../types/models'

const CHART_CONFIG = {
  revenue: { label: 'Revenue', color: 'var(--foreground)' },
  count: { label: 'Count', color: 'var(--chart-1)' },
  new: { label: 'New', color: 'var(--chart-1)' },
  renewal: { label: 'Renewal', color: 'var(--chart-4)' },
  starter: { label: 'Starter', color: PLAN_COLORS.starter },
  plus: { label: 'Plus', color: PLAN_COLORS.plus },
  premium: { label: 'Premium', color: PLAN_COLORS.premium },
} satisfies ChartConfig

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
    <Card size="sm">
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      </CardContent>
    </Card>
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
    <Card size="sm" className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
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

  if (loading) {
    return (
      <div className="mx-auto mt-10 max-w-6xl space-y-4 px-4 pb-16">
        <Skeleton className="h-8 w-40" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-72" />
          ))}
        </div>
      </div>
    )
  }
  if (!stats) {
    return <div className="mt-10 text-center text-muted-foreground">Could not load stats.</div>
  }

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
      <h1 className="mb-6 text-2xl font-semibold text-foreground">Dashboard</h1>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabId)}>
        <TabsList variant="line" className="mb-8">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="signups">
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
              <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[260px] w-full">
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₱${v}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard title="New signups per month">
              <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[260px] w-full">
                <BarChart data={signupData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard title={`Revenue per day · ${currentMonthLabel}`}>
              <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[260px] w-full">
                <BarChart data={revenueByDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₱${v}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard title={`New signups per day · ${currentMonthLabel}`}>
              <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[260px] w-full">
                <BarChart data={signupsByDayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard title="New subscriptions vs. renewals">
              <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[260px] w-full">
                <BarChart data={subscriptionActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar name="New" dataKey="new" fill="var(--color-new)" radius={[4, 4, 0, 0]} />
                  <Bar
                    name="Renewal"
                    dataKey="renewal"
                    fill="var(--color-renewal)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard title="Payments by plan per month">
              <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[260px] w-full">
                <BarChart data={paymentsByPlanData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar name="Starter" dataKey="starter" stackId="plan" fill="var(--color-starter)" />
                  <Bar name="Plus" dataKey="plus" stackId="plan" fill="var(--color-plus)" />
                  <Bar
                    name="Premium"
                    dataKey="premium"
                    stackId="plan"
                    fill="var(--color-premium)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard title="Plan distribution" className="lg:col-span-2">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[240px] w-full sm:w-1/2">
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
                </ChartContainer>
                <ul className="space-y-2 text-sm">
                  {planData.map((p) => (
                    <li key={p.plan} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: PLAN_COLORS[p.plan] }}
                      />
                      <span className="text-foreground">{p.label}</span>
                      <span className="text-muted-foreground">— {p.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="goodieBox">
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
              <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[260px] w-full">
                <BarChart data={goodieBoxRevenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₱${v}`} />
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="revenue" fill="var(--color-revenue)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard title="Goodie Box orders per month">
              <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[260px] w-full">
                <BarChart data={goodieBoxOrdersData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </ChartCard>

            <ChartCard title="Orders by delivery status" className="lg:col-span-2">
              <div className="flex flex-col items-center gap-6 sm:flex-row">
                <ChartContainer config={CHART_CONFIG} className="aspect-auto h-[240px] w-full sm:w-1/2">
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
                </ChartContainer>
                <ul className="space-y-2 text-sm">
                  {goodieBoxStatusData.map((s) => (
                    <li key={s.status} className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: DELIVERY_STATUS_COLORS[s.status] }}
                      />
                      <span className="text-foreground">{s.label}</span>
                      <span className="text-muted-foreground">— {s.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </ChartCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
