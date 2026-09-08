import { readdirSync } from 'node:fs'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { LOCALES } from '@/i18n/locales'
import { repoPath } from '@/test/paths'

const ORIGIN = 'https://nordogen.com'

async function loadSitemap() {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', ORIGIN)
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', undefined)
  return (await import('./sitemap')).default
}

/**
 * This file's own reads are cwd-independent, but the module under test calls
 * the Keystatic reader, and `createReader(process.cwd(), …)` in
 * `src/content/reader.ts` is cwd-based by design — Next always runs from the
 * project root, and deriving that root from a bundled module's location would
 * break once output tracing moves the file. So this one test still needs the
 * runner rooted at the repo, which `vitest.config.ts` guarantees.
 */
const SLUGS = readdirSync(repoPath('content/sr/products'))
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
