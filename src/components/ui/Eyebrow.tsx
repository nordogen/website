const TONE = {
  blue: 'text-brand-blue',
  tint: 'text-brand-blue-tint',
} as const

export function Eyebrow({
  children,
  tone = 'blue',
}: {
  children: React.ReactNode
  tone?: keyof typeof TONE
}) {
  return (
    <p className={`text-xs font-medium uppercase tracking-[0.16em] ${TONE[tone]}`}>{children}</p>
  )
}
