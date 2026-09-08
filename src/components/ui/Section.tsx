import { Container } from './Container'

const TONE = {
  paper: 'bg-paper text-ink',
  soft: 'bg-soft text-ink border-t border-ink/10',
  accent: 'on-dark bg-accent text-white',
  ink: 'on-dark bg-ink text-white',
} as const

const PAD = {
  default: 'py-12 lg:py-[5.125rem]',
  band: 'py-11 lg:py-16',
  product: 'py-11 lg:py-[4.5rem]',
} as const

export function Section({
  children,
  id,
  tone = 'paper',
  pad = 'default',
  className,
}: {
  children: React.ReactNode
  id?: string
  tone?: keyof typeof TONE
  pad?: keyof typeof PAD
  className?: string
}) {
  return (
    <section
      id={id}
      /* An id means something links to it, and everything that links to it has
         to clear the sticky header. Applied here rather than at each call site
         because forgetting it looks like a scrolling bug, not a missing class. */
      className={[TONE[tone], PAD[pad], id && 'section-anchor', className]
        .filter(Boolean)
        .join(' ')}
    >
      <Container>{children}</Container>
    </section>
  )
}
