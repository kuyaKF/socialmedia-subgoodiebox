import type { GoodieBoxDeliveryStatus, SubscriptionPlan } from '@/types/models'

// Reuses the --chart-1..5 CSS variables set in index.css so admin charts and
// status badges draw from the same palette instead of independently-chosen hex.
export const PLAN_COLORS: Record<SubscriptionPlan, string> = {
  free: 'var(--color-muted-foreground)',
  starter: 'var(--chart-4)',
  plus: 'var(--chart-1)',
  premium: 'var(--chart-2)',
}

export const DELIVERY_STATUS_COLORS: Record<GoodieBoxDeliveryStatus, string> = {
  pending_delivery: 'var(--chart-2)',
  in_progress: 'var(--chart-4)',
  complete: 'var(--chart-3)',
}

export const DELIVERY_STATUS_LABELS: Record<GoodieBoxDeliveryStatus, string> = {
  pending_delivery: 'Pending delivery',
  in_progress: 'In progress',
  complete: 'Complete',
}

// Tailwind pastel classes for StatusBadge — kept separate from the chart hex/CSS-var
// colors above since badges use flat bg-*-100/text-*-700 pairs, not raw chart fills.
export const DELIVERY_STATUS_BADGE_COLOR: Record<GoodieBoxDeliveryStatus, 'amber' | 'sky' | 'emerald'> = {
  pending_delivery: 'amber',
  in_progress: 'sky',
  complete: 'emerald',
}
