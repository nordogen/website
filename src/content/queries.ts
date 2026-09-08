import type { Locale } from '@/i18n/locales'
import { reader } from './reader'

const SITE_CHROME = {
  sr: reader.singletons.siteChromeSr,
  en: reader.singletons.siteChromeEn,
} as const

const HOME = {
  sr: reader.singletons.homeSr,
  en: reader.singletons.homeEn,
} as const

const PRODUCTS = {
  sr: reader.collections.productsSr,
  en: reader.collections.productsEn,
} as const

function required<T>(value: T | null, what: string): T {
  if (value === null) throw new Error(`Missing content: ${what}`)
  return value
}

export async function getSettings() {
  return required(await reader.singletons.settings.read(), 'content/settings')
}

export async function getSiteChrome(locale: Locale) {
  return required(await SITE_CHROME[locale].read(), `content/${locale}/site-chrome`)
}

export async function getHome(locale: Locale) {
  return required(await HOME[locale].read(), `content/${locale}/home`)
}

export type Product = Awaited<ReturnType<typeof getProducts>>[number]

/**
 * Every product in one locale, in editor-defined order. Throws when the
 * directory is empty, so a missing content directory is a build failure rather
 * than a silently empty product grid.
 */
export async function getProducts(locale: Locale) {
  const collection = PRODUCTS[locale]
  const slugs = await collection.list()

  const entries = await Promise.all(
    slugs.map(async (slug) => ({
      slug,
      ...required(await collection.read(slug), `content/${locale}/products/${slug}`),
    })),
  )

  if (entries.length === 0) throw new Error(`Missing content: content/${locale}/products is empty`)

  return entries.sort((a, b) => a.order - b.order)
}

export async function getProduct(locale: Locale, slug: string) {
  const entry = required(
    await PRODUCTS[locale].read(slug),
    `content/${locale}/products/${slug}`,
  )
  return { slug, ...entry }
}

export async function getProductSlugs(locale: Locale) {
  return PRODUCTS[locale].list()
}

/**
 * The products shown under a product page, at most three.
 *
 * Regeneration sits alongside every area rather than beside itself: recovery
 * support is a companion to a urology or a gynaecology product, so Renord
 * belongs in both of their groups — and on Renord's own page every product is
 * a sibling. Urology and gynaecology stay apart from each other.
 *
 * Same area first, then regeneration, so a page's closest neighbours lead.
 */
export async function getRelatedProducts(locale: Locale, slug: string, limit = 3) {
  const all = await getProducts(locale)
  const current = all.find((product) => product.slug === slug)
  if (!current) return []

  const others = all.filter((product) => product.slug !== slug)
  if (current.family === 'regeneration') return others.slice(0, limit)

  const sameFamily = others.filter((product) => product.family === current.family)
  const regeneration = others.filter((product) => product.family === 'regeneration')

  return [...sameFamily, ...regeneration].slice(0, limit)
}
