import Link from 'next/link'
import { LOCALES, type Locale } from '@/i18n/locales'

const LABEL: Record<Locale, string> = { sr: 'SR', en: 'EN' }

export function LanguageSwitcher({
  locale,
  path,
}: {
  locale: Locale
  path: string
}) {
  return (
    <div className="flex items-center gap-1">
      {LOCALES.map((target) => {
        const active = target === locale
        return (
          <Link
            key={target}
            href={`/${target}${path}`}
            hrefLang={target}
            aria-current={active ? 'true' : undefined}
            className={[
              'inline-flex min-h-11 min-w-11 items-center justify-center rounded-full px-3 text-sm font-medium',
              active ? 'bg-brand-teal text-white' : 'text-brand-teal hover:bg-brand-blue-tint/40',
            ].join(' ')}
          >
            {LABEL[target]}
          </Link>
        )
      })}
    </div>
  )
}
