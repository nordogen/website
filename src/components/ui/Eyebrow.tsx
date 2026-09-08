const TONE = {
  accent: 'text-accent',
  light: 'text-accent-light',
  /* On the accent band every level of text is full-opacity white by design —
     do not reintroduce alpha there. */
  onAccent: 'text-white',
} as const

const RULE = {
  accent: 'bg-accent',
  light: 'bg-accent-light',
  onAccent: 'bg-white',
} as const

/**
 * The small letterspaced label above a heading. `rule` adds the short leading
 * hairline used in the hero.
 */
export function Eyebrow({
  children,
  tone = 'accent',
  rule = false,
}: {
  children: React.ReactNode
  tone?: keyof typeof TONE
  rule?: boolean
}) {
  return (
    <p
      className={`flex items-center gap-2.5 text-[0.8125rem] font-medium uppercase leading-none tracking-[0.16em] lg:text-sm ${TONE[tone]}`}
    >
      {rule && <span aria-hidden="true" className={`h-px w-5 shrink-0 lg:w-[26px] ${RULE[tone]}`} />}
      {children}
    </p>
  )
}
