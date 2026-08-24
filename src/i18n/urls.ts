import { DEFAULT_LOCALE, LOCALES, type Locale } from './locales'

/** The host the site is meant to live on once the copy clears legal review. */
export const CANONICAL_HOST = 'nordogen.com'

/**
 * Resolved once at module load, so it is baked into the statically prerendered
 * pages at build time.
 *
 * `NEXT_PUBLIC_SITE_ORIGIN` is the explicit setting and should be set per
 * Vercel environment. `VERCEL_PROJECT_PRODUCTION_URL` is a safety net: it is
 * the project's *production* host, stable across preview deployments (unlike
 * `VERCEL_URL`, which changes on every push and would make canonical tags
 * churn). It is server-only, so a client component reading SITE_ORIGIN would
 * see the localhost fallback — set the NEXT_PUBLIC_ variable and this does not
 * arise.
 *
 * The last fallback is deliberately localhost, NOT the canonical host: a
 * misconfigured deployment must not silently publish canonical and hreflang
 * tags claiming to be the production site.
 */
function resolveOrigin(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_ORIGIN
  if (explicit) return explicit.replace(/\/$/, '')

  const vercelProduction = process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (vercelProduction) return `https://${vercelProduction}`

  return 'http://localhost:3000'
}

export const SITE_ORIGIN = resolveOrigin()

/**
 * Whether an origin is the real production site. Drives the indexing decision
 * in `robots.ts`: every other host — Vercel deployment URLs, localhost — must
 * stay out of search results while the copy still carries `[REVIEW]` markers.
 */
export function isProductionOrigin(origin: string): boolean {
  let host: string
  try {
    host = new URL(origin).hostname
  } catch {
    return false
  }
  return host === CANONICAL_HOST || host === `www.${CANONICAL_HOST}`
}

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
