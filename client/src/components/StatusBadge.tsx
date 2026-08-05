import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const COLOR_CLASSES = {
  slate: 'bg-slate-100 text-slate-700',
  blue: 'bg-blue-100 text-blue-700',
  purple: 'bg-purple-100 text-purple-700',
  amber: 'bg-amber-100 text-amber-700',
  sky: 'bg-sky-100 text-sky-700',
  emerald: 'bg-emerald-100 text-emerald-700',
} as const

export type StatusBadgeColor = keyof typeof COLOR_CLASSES

export function StatusBadge({
  label,
  color,
  className,
}: {
  label: string
  color: StatusBadgeColor
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn('border-transparent', COLOR_CLASSES[color], className)}>
      {label}
    </Badge>
  )
}
