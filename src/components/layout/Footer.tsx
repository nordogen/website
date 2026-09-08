import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { getProducts, getSiteChrome } from '@/content/queries'
import type { Locale } from '@/i18n/locales'
import { UI } from '@/i18n/ui'

export async function Footer({ locale }: { locale: Locale }) {
  const [chrome, products] = await Promise.all([getSiteChrome(locale), getProducts(locale)])
  const ui = UI[locale]

  return (
    <footer className="on-dark bg-ink text-[1rem] text-on-ink">
      <Container className="py-10 lg:py-14">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:gap-10">
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo className="text-accent-light" />
            <p className="mt-4 max-w-[34ch] leading-[1.65]">{chrome.footerTagline}</p>
          </div>

          <div>
            <h2 className="font-semibold text-white">{ui.footerProductsHeading}</h2>
            {/* Names, not links: the product pages do not exist yet. */}
            <ul className="mt-3.5 flex flex-col gap-2">
              {products.map((product) => (
                <li key={product.slug}>{product.name}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-white">{ui.footerCompanyHeading}</h2>
            <ul className="mt-1 flex flex-col">
              {ui.companyLinks.map((item) => (
                <li key={item.hash}>
                  <Link
                    href={`/${locale}${item.hash}`}
                    className="inline-flex min-h-11 items-center transition-colors duration-[140ms] ease-out hover:text-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-semibold text-white">{ui.footerLegalHeading}</h2>
            {/* Text, not links: the legal pages do not exist yet. */}
            <ul className="mt-3.5 flex flex-col gap-2">
              {ui.legalLinks.map((label) => (
                <li key={label}>{label}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/12 pt-5 text-sm leading-[1.65] sm:flex-row sm:items-baseline sm:justify-between sm:gap-8 lg:mt-11">
          {/* Legally mandated statement, from the five supplement declarations.
              Urinord is food for special medical purposes and carries a
              medical-supervision notice of its own instead. */}
          <p className="max-w-[70ch]">{chrome.supplementDisclaimer}</p>
          <p className="shrink-0">{chrome.copyright}</p>
        </div>
      </Container>
    </footer>
  )
}
