import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * SITE_ORIGIN is resolved once at module load, so every case has to stub the
 * environment and then re-import the module. `resetModules` clears the cached
 * evaluation; `unstubAllEnvs` in beforeEach stops a developer's own shell
 * variables from leaking between cases.
 */
async function loadUrls(env: Record<string, string | undefined>) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', env.NEXT_PUBLIC_SITE_ORIGIN)
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', env.VERCEL_PROJECT_PRODUCTION_URL)
  return import('./urls')
}

const PROD = { NEXT_PUBLIC_SITE_ORIGIN: 'https://nordogen.com' }

beforeEach(() => {
  vi.unstubAllEnvs()
})

describe('SITE_ORIGIN', () => {
  it('uses NEXT_PUBLIC_SITE_ORIGIN when set', async () => {
    const { SITE_ORIGIN } = await loadUrls({
      NEXT_PUBLIC_SITE_ORIGIN: 'https://staging.example.com',
    })
    expect(SITE_ORIGIN).toBe('https://staging.example.com')
  })

  it('strips a trailing slash from the configured origin', async () => {
    const { SITE_ORIGIN } = await loadUrls({
      NEXT_PUBLIC_SITE_ORIGIN: 'https://staging.example.com/',
    })
    expect(SITE_ORIGIN).toBe('https://staging.example.com')
  })

  it("falls back to Vercel's stable production URL", async () => {
    const { SITE_ORIGIN } = await loadUrls({
      VERCEL_PROJECT_PRODUCTION_URL: 'website-nordogen.vercel.app',
    })
    expect(SITE_ORIGIN).toBe('https://website-nordogen.vercel.app')
  })

  it('prefers the explicit origin over the Vercel fallback', async () => {
    const { SITE_ORIGIN } = await loadUrls({
      NEXT_PUBLIC_SITE_ORIGIN: 'https://nordogen.com',
      VERCEL_PROJECT_PRODUCTION_URL: 'website-nordogen.vercel.app',
    })
    expect(SITE_ORIGIN).toBe('https://nordogen.com')
  })

  // Deliberately NOT https://nordogen.com. A misconfigured deployment must not
  // silently publish canonical tags claiming to be the production site.
  it('falls back to localhost when nothing is configured', async () => {
    const { SITE_ORIGIN } = await loadUrls({})
    expect(SITE_ORIGIN).toBe('http://localhost:3000')
  })
})

describe('isProductionOrigin', () => {
  it('accepts the canonical host', async () => {
    const { isProductionOrigin } = await loadUrls(PROD)
    expect(isProductionOrigin('https://nordogen.com')).toBe(true)
    expect(isProductionOrigin('https://www.nordogen.com')).toBe(true)
  })

  it('rejects a Vercel deployment host', async () => {
    const { isProductionOrigin } = await loadUrls(PROD)
    expect(isProductionOrigin('https://website-nordogen.vercel.app')).toBe(false)
  })

  it('rejects localhost', async () => {
    const { isProductionOrigin } = await loadUrls(PROD)
    expect(isProductionOrigin('http://localhost:3000')).toBe(false)
  })

  it('rejects a lookalike host that merely ends with the canonical name', async () => {
    const { isProductionOrigin } = await loadUrls(PROD)
    expect(isProductionOrigin('https://evil-nordogen.com')).toBe(false)
  })

  it('rejects a malformed origin instead of throwing', async () => {
    const { isProductionOrigin } = await loadUrls(PROD)
    expect(isProductionOrigin('not a url')).toBe(false)
  })
})

describe('absoluteUrl', () => {
  it('prefixes the locale', async () => {
    const { absoluteUrl } = await loadUrls(PROD)
    expect(absoluteUrl('sr')).toBe('https://nordogen.com/sr')
    expect(absoluteUrl('en')).toBe('https://nordogen.com/en')
  })

  it('appends a path', async () => {
    const { absoluteUrl } = await loadUrls(PROD)
    expect(absoluteUrl('sr', '/products')).toBe('https://nordogen.com/sr/products')
  })

  it('normalises a missing leading slash', async () => {
    const { absoluteUrl } = await loadUrls(PROD)
    expect(absoluteUrl('sr', 'products')).toBe('https://nordogen.com/sr/products')
  })

  it('never emits a trailing slash', async () => {
    const { absoluteUrl } = await loadUrls(PROD)
    expect(absoluteUrl('en', '/')).toBe('https://nordogen.com/en')
  })

  // The root-path case above passes even if trailing-slash stripping is broken,
  // because the `suffix === '/'` guard already reduces it to ''. This case is
  // what actually pins the stripping behaviour.
  it('strips a trailing slash from a multi-segment path', async () => {
    const { absoluteUrl } = await loadUrls(PROD)
    expect(absoluteUrl('sr', '/products/')).toBe('https://nordogen.com/sr/products')
  })
})

describe('localeAlternates', () => {
  it('lists both locales plus x-default pointing at sr', async () => {
    const { localeAlternates } = await loadUrls(PROD)
    expect(localeAlternates('/about').languages).toEqual({
      sr: 'https://nordogen.com/sr/about',
      en: 'https://nordogen.com/en/about',
      'x-default': 'https://nordogen.com/sr/about',
    })
  })

  it('supplies the canonical for a given locale', async () => {
    const { localeAlternates } = await loadUrls(PROD)
    expect(localeAlternates('/about').canonicalFor('en')).toBe(
      'https://nordogen.com/en/about',
    )
  })
})
