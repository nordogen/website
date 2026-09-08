import Link from 'next/link'
import type { Locale } from '@/i18n/locales'
import { UI } from '@/i18n/ui'

/** EN first, SR second, as drawn. */
const ORDER: Locale[] = ['en', 'sr']
const LABEL: Record<Locale, string> = { sr: 'SR', en: 'EN' }

export function LanguageSwitcher({ locale, path = '' }: { locale: Locale; path?: string }) {
  return (
    <div className="flex items-center gap-3.5" aria-label={UI[locale].languageLabel}>
      {ORDER.map((target) => {
        const active = target === locale
        return (
          <Link
            key={target}
            href={`/${target}${path}`}
            hrefLang={target}
            aria-current={active ? 'true' : undefined}
            /* The 44px target is the link box; the underline hugs the text. */
            className="inline-flex min-h-11 items-center text-[0.8125rem] font-semibold"
          >
            <span
              className={
                active
                  ? 'border-b-2 border-accent pb-0.5 text-ink'
                  : 'border-b-2 border-transparent pb-0.5 text-inactive hover:text-ink'
              }
            >
              {LABEL[target]}
            </span>
          </Link>
        )
      })}
    </div>
  )
}
