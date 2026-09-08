import type { MetadataRoute } from 'next'
import { getProductSlugs } from '@/content/queries'
import { DEFAULT_LOCALE, LOCALES } from '@/i18n/locales'
import { localeAlternates } from '@/i18n/urls'

/**
 * Every visitor-facing URL, in both locales, with the hreflang set attached to
 * each entry. The origin comes from `SITE_ORIGIN` via `localeAlternates` — never
 * hardcode the host.
 *
 * Product slugs are read once, from the default locale: the two locales are the
 * same set of files, and `products.test.ts` fails the build if that ever stops
 * being true.
 *
 * No `lastModified`: nothing here tracks when a page's content actually
 * changed. Build time would claim every page changed on every deploy, and
 * content file mtimes do not survive a fresh checkout. A wrong date is worse
 * than none. `changeFrequency` and `priority` are omitted for the same reason —
 * they would be guesses, and Google ignores them.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const slugs = await getProductSlugs(DEFAULT_LOCALE)
  const paths = ['', ...slugs.map((slug) => `/products/${slug}`)]

  return paths.flatMap((path) => {
    const alternates = localeAlternates(path)
    return LOCALES.map((locale) => ({
      url: alternates.canonicalFor(locale),
      alternates: { languages: alternates.languages },
    }))
  })
}
