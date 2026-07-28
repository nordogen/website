import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import { getSiteChrome } from '@/content/queries'
import type { Locale } from '@/i18n/locales'
import { MobileNav, type NavItem } from './MobileNav'
import { LanguageSwitcher } from './LanguageSwitcher'

export async function Header({ locale }: { locale: Locale }) {
  const chrome = await getSiteChrome(locale)

  const items: NavItem[] = [
    { href: `/${locale}`, label: chrome.navHome },
    { href: `/${locale}/products`, label: chrome.navProducts },
    { href: `/${locale}/about`, label: chrome.navAbout },
    { href: `/${locale}/contact`, label: chrome.navContact },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-brand-blue-tint/40 bg-surface/90 backdrop-blur">
      <Container className="flex min-h-16 items-center justify-between gap-3 lg:min-h-20">
        <Link href={`/${locale}`} className="text-brand-blue">
          <Logo tagline={chrome.logoTagline} orientation="horizontal" />
        </Link>

        {/* No aria-label: only one nav is in the a11y tree per breakpoint (the
            other is display:none), so there is nothing to disambiguate and an
            unlabelled <nav> announces correctly as "navigation". Labelling it
            with a link's text would misname the landmark. */}
        <nav className="hidden lg:flex lg:items-center lg:gap-7">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-brand-teal hover:text-brand-blue"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher locale={locale} path="" />
          <MobileNav
            items={items}
            openLabel={chrome.menuOpenLabel}
            closeLabel={chrome.menuCloseLabel}
          />
        </div>
      </Container>
    </header>
  )
}
