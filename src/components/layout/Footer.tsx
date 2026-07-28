import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { getSettings, getSiteChrome } from '@/content/queries'
import type { Locale } from '@/i18n/locales'

export async function Footer({ locale }: { locale: Locale }) {
  const [chrome, settings] = await Promise.all([getSiteChrome(locale), getSettings()])

  return (
    <footer className="mt-16 bg-brand-teal text-white/85">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div className="sm:col-span-2 lg:col-span-1">
          <div className="text-white">
            <Logo tagline={chrome.logoTagline} orientation="horizontal" />
          </div>
          <p className="mt-4 max-w-xs text-sm">{chrome.footerTagline}</p>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
            {chrome.footerCompanyHeading}
          </h2>
          <ul className="mt-4 space-y-1 text-sm">
            <li>
              <Link href={`/${locale}/about`} className="inline-flex min-h-11 items-center hover:text-white">
                {chrome.navAbout}
              </Link>
            </li>
            <li>
              <Link href={`/${locale}/contact`} className="inline-flex min-h-11 items-center hover:text-white">
                {chrome.navContact}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
            {chrome.footerProductsHeading}
          </h2>
          <ul className="mt-4 space-y-1 text-sm">
            <li>
              <Link href={`/${locale}/products`} className="inline-flex min-h-11 items-center hover:text-white">
                {chrome.navProducts}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xs font-medium uppercase tracking-[0.16em] text-white">
            {chrome.footerLegalHeading}
          </h2>
          <address className="mt-4 text-sm not-italic">
            {settings.legalName}
            <br />
            {settings.street}
            <br />
            {settings.city}, {settings.country}
            <br />
            <a href={`mailto:${settings.email}`} className="inline-flex min-h-11 items-center hover:text-white">
              {settings.email}
            </a>
          </address>
        </div>
      </Container>

      <div className="border-t border-white/15">
        <Container className="flex flex-col gap-3 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          {/* Legally mandated statement — present on all six approved declarations. */}
          <p className="max-w-2xl">{chrome.supplementDisclaimer}</p>
          <p className="shrink-0">{chrome.copyright}</p>
        </Container>
      </div>
    </footer>
  )
}
