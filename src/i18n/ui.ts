import type { Locale } from './locales'

/**
 * Interface furniture: navigation, footer column headings and accessibility
 * labels. Deliberately NOT in Keystatic — these are structural, they change
 * only when the site's routes change, and exposing them to the editor invites
 * a menu whose labels no longer match the pages behind them.
 *
 * Marketing copy belongs in Keystatic. This file does not.
 *
 * Hashes rather than paths: /products, /about and /contact do not exist yet,
 * and the whole site is currently the one home page. Swap a `hash` for a
 * `path` here when the corresponding route lands.
 */
type Chrome = {
  skipToContent: string
  menuOpen: string
  menuClose: string
  languageLabel: string
  nav: { hash: string; label: string }[]
  footerProductsHeading: string
  footerCompanyHeading: string
  footerLegalHeading: string
  companyLinks: { hash: string; label: string }[]
  legalLinks: string[]
}

export const UI: Record<Locale, Chrome> = {
  sr: {
    skipToContent: 'Pređi na sadržaj',
    menuOpen: 'Otvori meni',
    menuClose: 'Zatvori meni',
    languageLabel: 'Izbor jezika',
    nav: [
      { hash: '#proizvodi', label: 'Proizvodi' },
      { hash: '#zasto', label: 'Zašto Nordogen' },
      { hash: '#kontakt', label: 'Kontakt' },
    ],
    footerProductsHeading: 'Proizvodi',
    footerCompanyHeading: 'Kompanija',
    footerLegalHeading: 'Pravno',
    companyLinks: [
      { hash: '#zasto', label: 'O Nordogenu' },
      { hash: '#kontakt', label: 'Kontakt' },
    ],
    legalLinks: ['Politika privatnosti', 'Uslovi korišćenja'],
  },
  en: {
    skipToContent: 'Skip to content',
    menuOpen: 'Open menu',
    menuClose: 'Close menu',
    languageLabel: 'Language',
    nav: [
      { hash: '#proizvodi', label: 'Products' },
      { hash: '#zasto', label: 'Why Nordogen' },
      { hash: '#kontakt', label: 'Contact' },
    ],
    footerProductsHeading: 'Products',
    footerCompanyHeading: 'Company',
    footerLegalHeading: 'Legal',
    companyLinks: [
      { hash: '#zasto', label: 'About Nordogen' },
      { hash: '#kontakt', label: 'Contact' },
    ],
    legalLinks: ['Privacy policy', 'Terms of use'],
  },
}

/** Section ids the nav points at. Kept here so the anchors cannot drift. */
export const SECTION_ID = {
  products: 'proizvodi',
  why: 'zasto',
  contact: 'kontakt',
} as const
