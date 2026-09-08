import Link from 'next/link'

const VARIANT = {
  /* On paper and soft grounds. */
  primary: 'bg-ink text-white hover:bg-ink-hover active:bg-ink-active',
  secondary: 'border-[1.5px] border-ink/25 text-ink hover:border-ink',
  /* On the ink and accent grounds. */
  primaryOnDark: 'bg-white text-ink hover:bg-paper-hover',
  secondaryOnDark: 'border-[1.5px] border-white/40 text-white hover:border-white',
} as const

/**
 * No transform, no shadow — this design has no shadows anywhere. The only
 * motion is the 140ms colour transition, which `prefers-reduced-motion`
 * removes globally in globals.css.
 */
export function Button({
  href,
  children,
  variant = 'primary',
  className,
}: {
  href: string
  children: React.ReactNode
  variant?: keyof typeof VARIANT
  className?: string
}) {
  const classes = [
    'inline-flex min-h-11 items-center justify-center rounded-btn px-[30px] py-[15px]',
    'text-[1.0625rem] font-semibold leading-none transition-colors duration-[140ms] ease-out',
    VARIANT[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  const external = href.startsWith('mailto:') || href.startsWith('http')
  if (external) {
    return (
      <a href={href} className={classes}>
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
