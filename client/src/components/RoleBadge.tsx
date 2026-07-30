import type { UserRole } from '../types/models'

const LABELS: Record<UserRole, string> = {
  user: 'Member',
  internal: 'Internal Team',
  admin: 'Admin',
}

const COLORS: Record<UserRole, string> = {
  user: 'bg-slate-100 text-slate-700',
  internal: 'bg-blue-100 text-blue-700',
  admin: 'bg-purple-100 text-purple-700',
}

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${COLORS[role]}`}>
      {LABELS[role]}
    </span>
  )
}
