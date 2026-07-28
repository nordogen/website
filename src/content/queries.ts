import type { Locale } from '@/i18n/locales'
import { reader } from './reader'

const SITE_CHROME = {
  sr: reader.singletons.siteChromeSr,
  en: reader.singletons.siteChromeEn,
} as const

const HOME = {
  sr: reader.singletons.homeSr,
  en: reader.singletons.homeEn,
} as const

function required<T>(value: T | null, what: string): T {
  if (value === null) throw new Error(`Missing content: ${what}`)
  return value
}

export async function getSettings() {
  return required(await reader.singletons.settings.read(), 'content/settings')
}

export async function getSiteChrome(locale: Locale) {
  return required(await SITE_CHROME[locale].read(), `content/${locale}/site-chrome`)
}

export async function getHome(locale: Locale) {
  return required(await HOME[locale].read(), `content/${locale}/home`)
}
