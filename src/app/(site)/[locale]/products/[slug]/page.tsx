import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { FAMILY_BADGE } from '@/components/products/ProductCard'
import { IngredientPills } from '@/components/products/IngredientPills'
import { ProductToc, type TocItem } from '@/components/products/ProductToc'
import { Container } from '@/components/ui/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Section } from '@/components/ui/Section'
import { getProduct, getProductSlugs, getRelatedProducts, type Product } from '@/content/queries'
import { LOCALES, isLocale, type Locale } from '@/i18n/locales'
import { PRODUCT_SECTION_ID, SECTION_ID, UI } from '@/i18n/ui'
import { SITE_NAME, pageMetadata } from '@/lib/seo'

/** The 3px rule on a benefit card, in the product's own accent. */
const FAMILY_RULE = {
  urology: 'border-t-product-blue',
  regeneration: 'border-t-product-teal',
  gynaecology: 'border-t-product-crimson',
} as const

export async function generateStaticParams() {
  const params = await Promise.all(
    LOCALES.map(async (locale) =>
      (await getProductSlugs(locale)).map((slug) => ({ locale, slug })),
    ),
  )
  return params.flat()
}

async function load(locale: string, slug: string) {
  if (!isLocale(locale)) return null
  const slugs = await getProductSlugs(locale)
  if (!slugs.includes(slug)) return null
  return getProduct(locale, slug)
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await load(locale, slug)
  if (!product || !isLocale(locale)) return {}

  return pageMetadata({
    locale,
    path: `/products/${slug}`,
    // The subtitle made titles 76-105 characters, well past where a search
    // result truncates. The badge label is short and carries the same words
    // someone would search for.
    title: product.metaTitle || `${product.name} — ${product.group} | ${SITE_NAME}`,
    // Clamped to a sentence by `pageMetadata`; the editor can override it.
    description: product.metaDescription || product.hero.intro,
  })
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params
  const product = await load(locale, slug)
  if (!product || !isLocale(locale)) notFound()

  const related = await getRelatedProducts(locale, slug)
  const ui = UI[locale]

  const hasBenefits = product.benefits.items.length > 0
  const hasUseCases = product.useCases.items.length > 0

  // Built from the sections that actually render — never a stored link list.
  const toc: TocItem[] = [
    { id: PRODUCT_SECTION_ID.audience, label: ui.toc.audience, show: true },
    { id: PRODUCT_SECTION_ID.benefits, label: ui.toc.benefits, show: hasBenefits },
    { id: PRODUCT_SECTION_ID.formula, label: ui.toc.formula, show: true },
    { id: PRODUCT_SECTION_ID.ingredients, label: ui.toc.ingredients, show: true },
    { id: PRODUCT_SECTION_ID.useCases, label: ui.toc.useCases, show: hasUseCases },
  ]
    .filter((item) => item.show)
    .map(({ id, label }) => ({ id, label }))

  const spec = [
    { label: ui.spec.dose, value: product.hero.dose },
    { label: ui.spec.pack, value: product.hero.pack },
    { label: ui.spec.duration, value: product.hero.duration },
  ].filter((cell) => cell.value)

  return (
    /* `has-sticky-toc` adds the on-page nav's height to every anchor offset
       inside it — see globals.css. Only this page has that bar. */
    <div className="has-sticky-toc">
      <nav aria-label={ui.breadcrumbLabel} className="border-b border-ink/8">
        <Container className="text-[0.875rem] text-muted lg:text-[0.9375rem]">
          <ol className="flex flex-wrap items-center gap-x-2">
            <li>
              <Link href={`/${locale}`} className="inline-flex min-h-11 min-w-11 items-center hover:text-ink">
                {ui.breadcrumbHome}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              {/* There is no products index yet, so this points at the home
                  page's product grid rather than at a route that 404s. */}
              <Link
                href={`/${locale}#${SECTION_ID.products}`}
                className="inline-flex min-h-11 min-w-11 items-center hover:text-ink"
              >
                {ui.nav[0]?.label}
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="flex min-h-11 items-center text-ink">
              {product.name}
            </li>
          </ol>
        </Container>
      </nav>

      {/* Hero. Mobile puts the panel above the copy as a full-width band. */}
      <div className="flex flex-col bg-panel lg:bg-transparent">
        <Container className="lg:grid lg:grid-cols-[1fr_1.05fr] lg:items-start lg:gap-14 lg:py-16 lg:pb-[3.75rem]">
          <div className="-mx-5 flex items-center justify-center bg-panel px-5 py-8 lg:mx-0 lg:min-h-[480px] lg:rounded-card lg:p-12">
            <Image
              src={`/products/${product.slug}.webp`}
              /* The one product image that is the subject of its page rather
                 than decoration beside a heading, so it carries real alt text
                 for image search. Card and related-product thumbs stay empty. */
              alt={`${product.name}, ${product.hero.pack}`}
              width={900}
              height={900}
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 560px, 82vw"
              className="max-h-[300px] w-auto max-w-[82%] object-contain lg:max-h-[440px] lg:max-w-full"
            />
          </div>

          <div className="-mx-5 flex flex-col gap-4 bg-paper px-5 pb-8 pt-7 lg:mx-0 lg:gap-5 lg:bg-transparent lg:p-0">
            <span
              className={`self-start rounded-btn px-[11px] py-1.5 text-[0.6875rem] font-semibold uppercase leading-none tracking-[0.1em] text-white lg:px-[13px] lg:py-[7px] lg:text-xs ${
                FAMILY_BADGE[product.family]
              }`}
            >
              {product.group}
            </span>

            <h1 className="font-display text-[clamp(2.25rem,4.4vw,3.875rem)] leading-[1.05] tracking-[-0.02em]">
              {product.name}
              <span className="align-super text-[0.4em]">®</span>
            </h1>

            {product.hero.subtitle ? (
              <h2 className="font-display text-[1.4375rem] leading-[1.3] text-accent lg:text-[1.6875rem]">
                {product.hero.subtitle}
              </h2>
            ) : null}

            <p className="leading-[1.7] text-ink-soft">{product.hero.intro}</p>

            <IngredientPills names={product.ingredients.items.map((item) => item.name)} />

            {/* Equal columns across the full width at every size, and two
                columns when a product has no duration — a fixed three-column
                grid left a dead cell there, and a left-packed flex row left
                dead space to the right of all three. */}
            <div
              className={`grid gap-3 border-y border-ink/12 py-[18px] lg:gap-9 lg:py-[22px] ${
                spec.length === 2 ? 'grid-cols-2' : 'grid-cols-3'
              }`}
            >
              {spec.map((cell) => (
                <div key={cell.label}>
                  <div className="mb-1 text-[0.875rem] text-muted">{cell.label}</div>
                  <div className="text-[1.0625rem] font-semibold lg:text-[1.125rem]">
                    {cell.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Not in the artboards. The source copy's dosing sentence carries
                instructions the spec row's figure cannot — how to take it, what
                to dissolve it in — and dropping them loses regulatory content. */}
            {product.hero.doseNote ? (
              <p className="text-[0.9375rem] leading-[1.6] text-muted">{product.hero.doseNote}</p>
            ) : null}
          </div>
        </Container>
      </div>

      <ProductToc items={toc} label={ui.tocLabel} />

      <Section id={PRODUCT_SECTION_ID.audience} pad="product">
        <div className="max-w-[900px]">
          <Eyebrow>{product.audience.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.16] tracking-[-0.015em] lg:mt-4">
            {product.audience.heading}
          </h2>
          <p className="mt-4 text-[1.125rem] leading-[1.7] text-ink-soft lg:mt-[22px] lg:text-[1.3125rem] lg:leading-[1.65]">
            {product.audience.body}
          </p>
        </div>
      </Section>

      {hasBenefits ? (
        <Section
          id={PRODUCT_SECTION_ID.benefits}
          tone="soft"
          pad="product"
         
        >
          <Eyebrow>{product.benefits.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.16] tracking-[-0.015em] lg:mt-4">
            {product.benefits.heading}
          </h2>
          <ul className="mt-6 grid gap-3.5 lg:mt-10 lg:grid-cols-3 lg:gap-5">
            {product.benefits.items.map((item) => (
              <li
                key={item.title}
                className={`rounded-card border border-ink/12 border-t-[3px] bg-white p-[22px] lg:p-7 ${
                  FAMILY_RULE[product.family]
                }`}
              >
                <h3 className="font-display text-2xl leading-[1.2] lg:text-[1.6875rem]">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-[1.0625rem] leading-[1.65] text-ink-soft lg:mt-3">
                  {item.body}
                </p>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section id={PRODUCT_SECTION_ID.formula} pad="product">
        <div className="max-w-[920px]">
          <Eyebrow>{product.formula.eyebrow}</Eyebrow>
          <h2 className="mt-3 font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.16] tracking-[-0.015em] lg:mt-4">
            {product.formula.heading}
          </h2>
          <p className="mt-4 text-[1.125rem] leading-[1.7] text-ink-soft lg:mt-[22px] lg:text-[1.3125rem] lg:leading-[1.65]">
            {product.formula.intro}
          </p>

          {product.formula.calloutBody ? (
            <div className="mt-6 border-l-[3px] border-accent bg-well p-[22px] lg:mt-8 lg:px-8 lg:py-7">
              {product.formula.calloutLabel ? (
                <p className="text-xs font-medium uppercase leading-none tracking-[0.16em] text-accent lg:text-[0.8125rem]">
                  {product.formula.calloutLabel}
                </p>
              ) : null}
              <p className="mt-2.5 text-[1.0625rem] leading-[1.75] text-ink-soft lg:mt-3 lg:text-[1.1875rem]">
                {product.formula.calloutBody}
              </p>
            </div>
          ) : null}
        </div>
      </Section>

      <Section
        id={PRODUCT_SECTION_ID.ingredients}
        tone="soft"
        pad="product"
       
      >
        <Eyebrow>{product.ingredients.eyebrow}</Eyebrow>
        <h2 className="mt-3 font-display text-[clamp(2rem,3.2vw,2.75rem)] leading-[1.16] tracking-[-0.015em] lg:mt-4">
          {product.ingredients.heading}
        </h2>
        <ul className="mt-6 grid gap-3.5 lg:mt-10 lg:grid-cols-2 lg:gap-5">
          {product.ingredients.items.map((item) => (
            <li
              key={item.name}
              className="rounded-card border border-ink/12 bg-white p-[22px] lg:p-7"
            >
              <div className="border-b border-ink/12 pb-3 lg:flex lg:items-baseline lg:justify-between lg:gap-5 lg:pb-3.5">
                <h3 className="font-display text-2xl leading-[1.2] lg:text-[1.6875rem]">
                  {item.name}
                </h3>
                {/* Optional: with no figure the name takes the full width and
                    the hairline stays. */}
                {item.amount ? (
                  <span className="mt-1 block text-[0.9375rem] font-semibold leading-none text-accent lg:mt-0 lg:whitespace-nowrap">
                    {item.amount}
                  </span>
                ) : null}
              </div>
              <p className="mt-3 text-[1.0625rem] leading-[1.65] text-ink-soft lg:mt-3.5">
                {item.role}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      {hasUseCases ? (
        <Section id={PRODUCT_SECTION_ID.useCases} pad="product">
          <div className="lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14">
            <div>
              <Eyebrow>{product.useCases.eyebrow}</Eyebrow>
              <h2 className="mt-3 font-display text-[clamp(2rem,3vw,2.625rem)] leading-[1.16] tracking-[-0.015em] lg:mt-4">
                {product.useCases.heading}
              </h2>
            </div>
            <ul className="mt-5 flex flex-col lg:mt-0">
              {product.useCases.items.map((item) => (
                <li
                  key={item}
                  className="border-t border-ink/14 py-4 text-[1.0625rem] leading-[1.7] text-ink-soft last:border-b last:border-ink/14 lg:py-5 lg:text-[1.1875rem]"
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Section>
      ) : null}

      {related.length > 0 ? (
        <Section tone="soft" pad="band">
          <h2 className="font-display text-[clamp(1.875rem,2.6vw,2.25rem)] leading-[1.18] tracking-[-0.01em]">
            {ui.relatedHeading}
          </h2>
          {/* Gynaecology has one sibling plus Renord, so this row is
              sometimes two cards. Let them share the width rather than leaving
              a hole in a three-column grid. */}
          <ul
            className={`mt-4 grid gap-3 lg:mt-[26px] lg:gap-5 ${
              related.length === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'
            }`}
          >
            {related.map((item) => (
              <li key={item.slug}>
                <RelatedCard product={item} locale={locale} />
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      {/* Regulatory copy. Never optional, and never on a tinted white. */}
      <Section tone="accent" pad="band">
        <div className="lg:grid lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-14">
          <div>
            <Eyebrow tone="onAccent">{product.notes.eyebrow}</Eyebrow>
            <h2 className="mt-3 font-display text-[clamp(1.875rem,2.9vw,2.5rem)] leading-[1.16] lg:mt-4">
              {product.notes.heading}
            </h2>
          </div>
          <div className="mt-5 lg:mt-0">
            <p className="leading-[1.7]">{product.notes.warnings}</p>
            <p className="mt-5 border-t border-white/30 pt-5 text-[0.9375rem] leading-[1.7]">
              {product.notes.legalNote}
            </p>
          </div>
        </div>
      </Section>
    </div>
  )
}

function RelatedCard({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <Link
      href={`/${locale}/products/${product.slug}`}
      className="flex h-full items-center gap-4 rounded-card border border-ink/12 bg-white p-4 transition-colors duration-[140ms] ease-out hover:border-accent lg:gap-[18px] lg:p-5"
    >
      <Image
        src={`/products/${product.slug}.webp`}
        alt=""
        width={96}
        height={96}
        sizes="96px"
        className="h-[72px] w-[72px] shrink-0 object-contain lg:h-24 lg:w-24"
      />
      <span>
        <span className="block font-display text-[1.375rem] leading-[1.1] lg:text-2xl">
          {product.name}
        </span>
        <span className="mt-1 block text-base text-muted">{product.summary}</span>
      </span>
    </Link>
  )
}
