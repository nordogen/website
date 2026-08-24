import type { MetadataRoute } from 'next'
import { SITE_ORIGIN, isProductionOrigin } from '@/i18n/urls'

/**
 * Indexing is gated on the host, not on NODE_ENV: staging and preview
 * deployments are production builds. Until the authored copy clears legal
 * review it still carries `[REVIEW]` markers — in the `<h1>` and the meta
 * description — so nothing but the canonical host may be crawled.
 *
 * No `sitemap` entry yet: `sitemap.ts` does not exist, and pointing crawlers at
 * a 404 is worse than omitting the line.
 */
export default function robots(): MetadataRoute.Robots {
  return isProductionOrigin(SITE_ORIGIN)
    ? { rules: { userAgent: '*', allow: '/' } }
    : { rules: { userAgent: '*', disallow: '/' } }
}
