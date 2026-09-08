import Link from 'next/link'
import { Logo } from '@/components/brand/Logo'
import { Container } from '@/components/ui/Container'
import type { Locale } from '@/i18n/locales'
import { UI } from '@/i18n/ui'
import { LanguageSwitcher } from './LanguageSwitcher'
import { MobileNav, type NavItem } from './MobileNav'

export function Header({ locale }: { locale: Locale }) {
  const chrome = UI[locale]
  const items: NavItem[] = chrome.nav.map((item) => ({
    href: `/${locale}${item.hash}`,
    label: item.label,
  }))

  return (
    // Sticky from scroll 0, and it gains no shadow: the 1px bottom border is
    // the only separation at every scroll position. `relative` positions the
    // mobile drawer.
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper">
      <Container className="relative flex items-center justify-between gap-8 py-3.5 lg:py-5">
        <Link href={`/${locale}`} className="inline-flex min-h-11 items-center text-ink">
          <Logo />
        </Link>

        {/* No aria-label: only one nav is in the accessibility tree per
            breakpoint, so there is nothing to disambiguate. */}
        <nav className="hidden lg:flex lg:items-center lg:gap-8">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex min-h-11 items-center text-[1.0625rem] font-medium text-nav transition-colors duration-[140ms] ease-out hover:text-ink"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <LanguageSwitcher locale={locale} />
          <MobileNav items={items} openLabel={chrome.menuOpen} closeLabel={chrome.menuClose} />
        </div>
      </Container>
    </header>
  )
}
