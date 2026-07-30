import { avatarColor, initials } from '../utils/avatar'

export function Avatar({ name, size = 8 }: { name: string; size?: 7 | 8 | 9 }) {
  const sizeClasses = { 7: 'h-7 w-7 text-xs', 8: 'h-8 w-8 text-xs', 9: 'h-9 w-9 text-sm' }[size]
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClasses} ${avatarColor(name)}`}
    >
      {initials(name)}
    </div>
  )
}
