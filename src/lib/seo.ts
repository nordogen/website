import type { Metadata } from 'next'
import type { Locale } from '@/i18n/locales'
import { localeAlternates } from '@/i18n/urls'

export const SITE_NAME = 'NORDOGEN'

/** Open Graph wants a full locale, not a language code. */
const OG_LOCALE: Record<Locale, string> = { sr: 'sr_RS', en: 'en_US' }

/**
 * Search results cut a description around 155 characters. Trim at the end of a
 * sentence when there is one in range, otherwise at a word boundary — never
 * mid-word, and never with an ellipsis pretending a sentence ended.
 */
export function clampDescription(text: string, max = 155): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean

  const window = clean.slice(0, max + 1)
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('! '))
  if (sentenceEnd > max * 0.6) return clean.slice(0, sentenceEnd + 1)

  return `${window.slice(0, window.lastIndexOf(' ')).replace(/[,;:]$/, '')}…`
}

/**
 * Canonical, hreflang, Open Graph and Twitter for one page, from one place.
 *
 * No `images` yet: there are no OG images, and an `og:image` pointing at
 * nothing is worse than none — a card with a broken image beats no card only in
 * theory. Add them here when they exist, and they will apply everywhere at once.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
}: {
  locale: Locale
  path: string
  title: string
  description: string
}): Metadata {
  const alternates = localeAlternates(path)
  const url = alternates.canonicalFor(locale)
  const trimmed = clampDescription(description)

  return {
    title,
    description: trimmed,
    alternates: { canonical: url, languages: alternates.languages },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      title,
      description: trimmed,
      url,
      locale: OG_LOCALE[locale],
      alternateLocale: Object.values(OG_LOCALE).filter((l) => l !== OG_LOCALE[locale]),
    },
    twitter: { card: 'summary', title, description: trimmed },
  }
}
