import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales'

export const SITE_ORIGIN = 'https://nordogen.com'

export function absoluteUrl(locale: Locale, path = ''): string {
  const suffix = path.replace(/^\/?/, '/').replace(/\/$/, '')
  return `${SITE_ORIGIN}/${locale}${suffix === '/' ? '' : suffix}`
}

export function localeAlternates(path = '') {
  const languages: Record<string, string> = {}
  for (const locale of LOCALES) languages[locale] = absoluteUrl(locale, path)
  languages['x-default'] = absoluteUrl(DEFAULT_LOCALE, path)

  return {
    languages,
    canonicalFor: (locale: Locale) => absoluteUrl(locale, path),
  }
}
