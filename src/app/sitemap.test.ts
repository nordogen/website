import { readdirSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LOCALES } from '@/i18n/locales'

const ORIGIN = 'https://nordogen.com'

async function loadSitemap() {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', ORIGIN)
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', undefined)
  return (await import('./sitemap')).default
}

const SLUGS = readdirSync('content/sr/products')
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''))

beforeEach(() => {
  vi.unstubAllEnvs()
})

describe('sitemap', () => {
  it('lists the home page and every product, in every locale', async () => {
    const entries = await (await loadSitemap())()
    const expected = ['', ...SLUGS.map((slug) => `/products/${slug}`)].flatMap((path) =>
      LOCALES.map((locale) => `${ORIGIN}/${locale}${path}`),
    )
    expect(entries.map((entry) => entry.url).sort()).toEqual(expected.sort())
  })

  it('reads the origin rather than hardcoding the host', async () => {
    vi.resetModules()
    vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', 'https://staging.example.com')
    vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', undefined)
    const entries = await (await import('./sitemap')).default()
    expect(entries.every((entry) => entry.url.startsWith('https://staging.example.com/'))).toBe(
      true,
    )
  })

  it('gives every entry the full hreflang set', async () => {
    const entries = await (await loadSitemap())()
    for (const entry of entries) {
      expect(Object.keys(entry.alternates?.languages ?? {}).sort()).toEqual([
        ...[...LOCALES].sort(),
        'x-default',
      ])
    }
  })

  it('points x-default at Serbian', async () => {
    const entries = await (await loadSitemap())()
    for (const entry of entries) {
      const languages = entry.alternates?.languages as Record<string, string>
      expect(languages['x-default']).toBe(languages.sr)
    }
  })

  it('never lists a locale-less URL', async () => {
    // Locales are always prefixed; `/` is a redirect, not a page.
    const entries = await (await loadSitemap())()
    for (const entry of entries) {
      expect(entry.url).toMatch(new RegExp(`^${ORIGIN}/(${LOCALES.join('|')})(/|$)`))
    }
  })
})
