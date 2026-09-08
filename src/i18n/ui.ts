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
  breadcrumbHome: string
  relatedHeading: string
  /** Short labels for the on-page nav. Kept apart from the section headings,
      which are authored per product and far too long for a single row. */
  toc: Record<ProductSection, string>
  tocLabel: string
  breadcrumbLabel: string
  spec: { dose: string; pack: string; duration: string }
  /** Used in the structured data, where the regulatory category has to be said
      in words rather than implied by a schema.org type. */
  productCategory: { supplement: string; fsmp: string }
  mandatoryNotice: string
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
    breadcrumbHome: 'Početna',
    relatedHeading: 'Iz iste grupe',
    toc: {
      audience: 'Kome je namenjen',
      benefits: 'Prednosti',
      formula: 'Formula',
      ingredients: 'Sastav',
      useCases: 'Praktična primena',
    },
    tocLabel: 'Na ovoj strani',
    breadcrumbLabel: 'Putanja',
    spec: { dose: 'Doziranje', pack: 'Pakovanje', duration: 'Trajanje' },
    productCategory: {
      supplement: 'Dodatak ishrani',
      fsmp: 'Hrana za posebne medicinske namene',
    },
    mandatoryNotice: 'Važno obaveštenje',
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
    breadcrumbHome: 'Home',
    relatedHeading: 'More in this range',
    toc: {
      audience: 'Who it is for',
      benefits: 'Benefits',
      formula: 'Formula',
      ingredients: 'Ingredients',
      useCases: 'How to use',
    },
    tocLabel: 'On this page',
    breadcrumbLabel: 'Breadcrumb',
    spec: { dose: 'Dosage', pack: 'Pack size', duration: 'Duration' },
    productCategory: {
      supplement: 'Food supplement',
      fsmp: 'Food for special medical purposes',
    },
    mandatoryNotice: 'Important notice',
  },
}

/** Section ids the nav points at. Kept here so the anchors cannot drift. */
export const SECTION_ID = {
  products: 'proizvodi',
  why: 'zasto',
  contact: 'kontakt',
} as const

/**
 * The product page's own sections, in the order the on-page nav lists them.
 * Benefits and use cases are optional per product, so the nav is built from
 * the sections that actually render — never from a stored link list.
 */
export const PRODUCT_SECTION_ID = {
  audience: 'namena',
  benefits: 'prednosti',
  formula: 'formula',
  ingredients: 'sastav',
  useCases: 'primena',
} as const

export type ProductSection = keyof typeof PRODUCT_SECTION_ID

export const PRODUCT_SECTIONS = Object.keys(PRODUCT_SECTION_ID) as ProductSection[]
