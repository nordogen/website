import Image from 'next/image'
import type { Product } from '@/content/queries'

/**
 * Blue is the only accent whose badge fill differs from the accent itself:
 * white text on #4C88A8 does not clear 4.5:1, so the badge uses a darker blue.
 */
const BADGE = {
  blue: 'bg-badge-blue',
  teal: 'bg-product-teal',
  crimson: 'bg-product-crimson',
} as const

/**
 * Rendered as an article, not a link: product pages do not exist yet, and a
 * card-sized link to nowhere is worse than no link. Wrap it in an anchor when
 * `/[locale]/products/[slug]` lands.
 */
export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="flex flex-col gap-3 rounded-card border border-ink/12 bg-white p-[18px] lg:gap-3.5 lg:p-6">
      <span
        className={`self-start rounded-btn px-[11px] py-1.5 text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.1em] text-white lg:px-[13px] lg:py-[7px] lg:text-xs ${
          BADGE[product.accent]
        }`}
      >
        {product.group}
      </span>

      <div className="relative h-[180px] bg-well lg:h-[210px]">
        <Image
          src={`/products/${product.slug}.webp`}
          /* Decorative: the product name is the adjacent heading, so alt text
             here would just make a screen reader say it twice. */
          alt=""
          fill
          sizes="(min-width: 1024px) 380px, 90vw"
          /* The renders sit on white, so multiply drops that ground onto the
             well instead of stamping a white rectangle over it. */
          className="object-contain p-[7%] mix-blend-multiply"
        />
      </div>

      <h3 className="font-display text-[1.6875rem] leading-[1.1] tracking-[-0.01em] lg:text-[1.875rem]">
        {product.name}
      </h3>

      {/* Three lines' worth of reserved height on desktop. Summaries run one to
          three lines, and without this the hairline below lands at a different
          height in every card of the row. Cards still stretch to a common
          height; the slack goes below the ingredient line instead of above it. */}
      <p className="text-[1.0625rem] leading-[1.55] text-ink-soft lg:min-h-[4.65em]">
        {product.summary}
      </p>

      {/* Optional: with no ingredient line, the row and its hairline both go. */}
      {product.ingredients ? (
        <p className="border-t border-ink/10 pt-3 text-[0.9375rem] leading-[1.55] text-muted lg:pt-3.5">
          {product.ingredients}
        </p>
      ) : null}
    </article>
  )
}
