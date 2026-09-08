import { beforeEach, describe, expect, it, vi } from 'vitest'

async function loadRobots(origin: string | undefined) {
  vi.resetModules()
  vi.stubEnv('NEXT_PUBLIC_SITE_ORIGIN', origin)
  vi.stubEnv('VERCEL_PROJECT_PRODUCTION_URL', undefined)
  return (await import('./robots')).default
}

beforeEach(() => {
  vi.unstubAllEnvs()
})

describe('robots', () => {
  it('allows crawling on the production host, and advertises the sitemap', async () => {
    const robots = await loadRobots('https://nordogen.com')
    expect(robots()).toEqual({
      rules: { userAgent: '*', allow: '/' },
      sitemap: 'https://nordogen.com/sitemap.xml',
    })
  })

  it('advertises no sitemap on a host it has just told crawlers to stay off', async () => {
    for (const origin of ['https://website-nordogen.vercel.app', undefined]) {
      const robots = await loadRobots(origin)
      expect(robots().sitemap).toBeUndefined()
    }
  })

  it('blocks crawling on a Vercel deployment host', async () => {
    const robots = await loadRobots('https://website-nordogen.vercel.app')
    expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } })
  })

  it('blocks crawling when no origin is configured', async () => {
    const robots = await loadRobots(undefined)
    expect(robots()).toEqual({ rules: { userAgent: '*', disallow: '/' } })
  })
})
