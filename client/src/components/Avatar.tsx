import { useState } from 'react'
import { avatarColor, initials } from '../utils/avatar'

export function Avatar({
  name,
  avatarUrl,
  size = 8,
}: {
  name: string
  avatarUrl?: string
  size?: 7 | 8 | 9 | 20
}) {
  const [imgError, setImgError] = useState(false)
  const sizeClasses = {
    7: 'h-7 w-7 text-xs',
    8: 'h-8 w-8 text-xs',
    9: 'h-9 w-9 text-sm',
    20: 'h-20 w-20 text-2xl',
  }[size]

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`shrink-0 rounded-full object-cover ${sizeClasses}`}
      />
    )
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${sizeClasses} ${avatarColor(name)}`}
    >
      {initials(name)}
    </div>
  )
}
