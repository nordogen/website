/**
 * The ingredient list, as outlined pills. Static and non-interactive — they are
 * not filters and not links, so they get no hover or focus state.
 *
 * Shared by the home page card and the product page hero on purpose: the same
 * data rendered two different ways is how the two drift.
 */
export function IngredientPills({
  names,
  className,
}: {
  names: readonly string[]
  className?: string
}) {
  if (names.length === 0) return null

  return (
    <ul className={['flex flex-wrap gap-2', className].filter(Boolean).join(' ')}>
      {names.map((name) => (
        <li
          key={name}
          className="rounded-pill border border-ink/18 px-3.5 py-1.5 text-[0.9375rem] leading-tight lg:px-4 lg:py-2"
        >
          {name}
        </li>
      ))}
    </ul>
  )
}
