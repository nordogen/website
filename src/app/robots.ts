import type { MetadataRoute } from 'next'
import { SITE_ORIGIN, isProductionOrigin } from '@/i18n/urls'

/**
 * Indexing is gated on the host, not on NODE_ENV: staging and preview
 * deployments are production builds, so nothing but the canonical host may be
 * crawled.
 *
 * The `sitemap` line is gated on the same check. A host that disallows
 * everything has no business advertising a sitemap, and pointing crawlers at
 * one from a preview deployment would leak its URLs into the index by another
 * route.
 */
export default function robots(): MetadataRoute.Robots {
  if (!isProductionOrigin(SITE_ORIGIN)) {
    return { rules: { userAgent: '*', disallow: '/' } }
  }

  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: `${SITE_ORIGIN}/sitemap.xml`,
  }
}
