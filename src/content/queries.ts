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
