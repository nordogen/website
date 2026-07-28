import { Container } from './Container'

const TONE = {
  surface: 'bg-surface text-ink',
  tint: 'bg-brand-blue-tint/25 text-ink',
  teal: 'bg-brand-teal text-white',
} as const

export function Section({
  children,
  tone = 'surface',
  className,
}: {
  children: React.ReactNode
  tone?: keyof typeof TONE
  className?: string
}) {
  return (
    <section className={[TONE[tone], 'relative overflow-hidden py-16 sm:py-20 lg:py-28', className].filter(Boolean).join(' ')}>
      <Container>{children}</Container>
    </section>
  )
}
