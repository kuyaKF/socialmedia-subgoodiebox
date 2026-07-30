type IconProps = { className?: string }

const base = {
  viewBox: '0 0 20 20',
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function PencilIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} className={className}>
      <path d="M13.5 3.5a2.121 2.121 0 0 1 3 3L7 16l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} className={className}>
      <path d="M4 6h12M8 6V4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2m3 0-.7 10.1a2 2 0 0 1-2 1.9H6.7a2 2 0 0 1-2-1.9L4 6h12Z" />
    </svg>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M4 10l4 4 8-8" />
    </svg>
  )
}

export function XIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} className={className}>
      <circle cx="9" cy="9" r="6" />
      <path d="M17 17l-3.5-3.5" />
    </svg>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={2} className={className}>
      <path d="M10 4v12M4 10h12" />
    </svg>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} className={className}>
      <path d="M5 7.5l5 5 5-5" />
    </svg>
  )
}

export function GiftIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} className={className}>
      <rect x="3" y="8" width="14" height="9" rx="1" />
      <path d="M3 11h14M10 8v9" />
      <path d="M10 8C8.5 8 7 7 7 5.5A1.5 1.5 0 0 1 8.5 4C9.5 4 10 6 10 8Z" />
      <path d="M10 8c1.5 0 3-1 3-2.5A1.5 1.5 0 0 0 11.5 4C10.5 4 10 6 10 8Z" />
    </svg>
  )
}

export function UsersIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} className={className}>
      <circle cx="7" cy="7" r="3" />
      <path d="M2 17c0-2.8 2.2-5 5-5s5 2.2 5 5" />
      <circle cx="14.5" cy="7.5" r="2.3" />
      <path d="M12.8 12.2c2.2.4 3.7 2.3 3.7 4.8" />
    </svg>
  )
}

export function SparklesIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} className={className}>
      <path d="M9 3v3M9 12v3M3 9h3M12 9h3M4.5 4.5l2 2M11.5 11.5l2 2M15.5 4.5l-2 2M6.5 11.5l-2 2" />
      <circle cx="9" cy="9" r="1.5" />
    </svg>
  )
}

export function XSocialIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15 3h2.3l-5 5.7L18 17h-4.6l-3.6-4.7L5.6 17H3.3l5.4-6.1L3 3h4.7l3.3 4.3L15 3Zm-.8 12.6h1.3L6 4.3H4.6l9.6 11.3Z" />
    </svg>
  )
}

export function InstagramIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} className={className}>
      <rect x="3" y="3" width="14" height="14" rx="4" />
      <circle cx="10" cy="10" r="3.2" />
      <circle cx="14.3" cy="5.7" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  )
}

export function FacebookIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12 4h2V1h-2c-2.2 0-4 1.8-4 4v2H6v3h2v9h3v-9h2.2l.8-3H11V5c0-.6.4-1 1-1Z" />
    </svg>
  )
}

export function HeartIcon({ className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M10 17s-6.5-4.1-6.5-8.5A3.5 3.5 0 0 1 10 6a3.5 3.5 0 0 1 6.5 2.5C16.5 12.9 10 17 10 17Z" />
    </svg>
  )
}

export function MessageIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} className={className}>
      <path d="M3 5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H8l-4 3v-3H5a2 2 0 0 1-2-2V5Z" />
    </svg>
  )
}

export function MegaphoneIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} className={className}>
      <path d="M3 9v2a1 1 0 0 0 1 1h1l6 4V4L5 8H4a1 1 0 0 0-1 1Z" />
      <path d="M13 6.5c1 .7 1.7 1.9 1.7 3.5s-.7 2.8-1.7 3.5M15.5 4c1.8 1.3 3 3.5 3 6s-1.2 4.7-3 6" />
    </svg>
  )
}

export function BookIcon({ className }: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} className={className}>
      <path d="M3 4.5A1.5 1.5 0 0 1 4.5 3H9v14H4.5A1.5 1.5 0 0 1 3 15.5v-11ZM17 4.5A1.5 1.5 0 0 0 15.5 3H11v14h4.5a1.5 1.5 0 0 0 1.5-1.5v-11Z" />
    </svg>
  )
}

export function GripIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
      <circle cx="7" cy="5" r="1.2" />
      <circle cx="13" cy="5" r="1.2" />
      <circle cx="7" cy="10" r="1.2" />
      <circle cx="13" cy="10" r="1.2" />
      <circle cx="7" cy="15" r="1.2" />
      <circle cx="13" cy="15" r="1.2" />
    </svg>
  )
}
