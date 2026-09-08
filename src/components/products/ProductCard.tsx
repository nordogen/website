import Image from 'next/image'
import Link from 'next/link'
import type { Product } from '@/content/queries'
import type { Locale } from '@/i18n/locales'
import { IngredientPills } from './IngredientPills'

/**
 * Urology's badge fill is darker than its accent: white text on the accent
 * itself does not clear 4.5:1.
 */
export const FAMILY_BADGE = {
  urology: 'bg-badge-blue',
  regeneration: 'bg-product-teal',
  gynaecology: 'bg-product-crimson',
} as const

export function ProductCard({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="group flex flex-col gap-3 rounded-card border border-ink/12 bg-white p-[18px] transition-colors duration-[140ms] ease-out hover:border-accent lg:gap-3.5 lg:p-6"
    >
      <span
        className={`self-start rounded-btn px-[11px] py-1.5 text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.1em] text-white lg:px-[13px] lg:py-[7px] lg:text-xs ${
          FAMILY_BADGE[product.family]
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
          /* The cutouts are cropped tight, so the padding is what sets how much
             of the well the box fills — the artboards draw it at ~88%. */
          className="object-contain p-3 lg:p-3.5"
        />
      </div>

      <h3 className="font-display text-[1.6875rem] leading-[1.1] tracking-[-0.01em] lg:text-[1.875rem]">
        {product.name}
      </h3>

      {/* Three lines' worth of reserved height on desktop. Summaries run one to
          three lines, and without this the hairline below lands at a different
          height in every card of the row. */}
      <p className="text-[1.0625rem] leading-[1.55] text-ink-soft lg:min-h-[4.65em]">
        {product.summary}
      </p>

      <IngredientPills
        names={product.ingredients.items.map((item) => item.name)}
        className="border-t border-ink/10 pt-3 lg:pt-3.5"
      />
    </Link>
  )
}
