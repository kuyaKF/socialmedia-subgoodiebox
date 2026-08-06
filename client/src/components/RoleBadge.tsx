import type { UserRole } from '../types/models'
import { StatusBadge, type StatusBadgeColor } from './StatusBadge'

const LABELS: Record<UserRole, string> = {
  user: 'Member',
  internal: 'Internal Team',
  admin: 'Admin',
}

const COLORS: Record<UserRole, StatusBadgeColor> = {
  user: 'slate',
  internal: 'blue',
  admin: 'purple',
}

export function RoleBadge({ role }: { role: UserRole }) {
  return <StatusBadge label={LABELS[role]} color={COLORS[role]} />
}
