import Link from 'next/link'

const VARIANT = {
  primary: 'bg-brand-teal text-white hover:opacity-90',
  secondary: 'border border-brand-teal text-brand-teal hover:bg-brand-blue-tint/30',
  light: 'bg-white text-brand-teal hover:bg-brand-blue-tint',
} as const

export function Button({
  href,
  children,
  variant = 'primary',
}: {
  href: string
  children: React.ReactNode
  variant?: keyof typeof VARIANT
}) {
  return (
    <Link
      href={href}
      className={[
        'inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-medium transition-colors',
        VARIANT[variant],
      ].join(' ')}
    >
      {children}
    </Link>
  )
}
