import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LOCALES, type Locale } from '@/i18n/locales'

type Doc = {
  name: string
  order: number
  accent: string
  category: string
  regulatoryNote: string
  [key: string]: unknown
}

function slugsIn(locale: Locale): string[] {
  return readdirSync(`content/${locale}/products`)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort()
}

function doc(locale: Locale, slug: string): Doc {
  return JSON.parse(readFileSync(`content/${locale}/products/${slug}.json`, 'utf8')) as Doc
}

const SLUGS = slugsIn('sr')

describe('product content', () => {
  it('has the same products in every locale', () => {
    for (const locale of LOCALES) expect(slugsIn(locale)).toEqual(SLUGS)
  })

  it('ships a photo for every slug', () => {
    // The photo is derived from the slug rather than stored as a CMS field, so
    // a renamed product silently loses its image unless this holds.
    for (const slug of SLUGS) expect(existsSync(`public/products/${slug}.webp`), slug).toBe(true)
  })

  it('keeps name, order, accent and category identical across locales', () => {
    for (const slug of SLUGS) {
      const sr = doc('sr', slug)
      const en = doc('en', slug)
      expect({ name: en.name, order: en.order, accent: en.accent, category: en.category }).toEqual({
        name: sr.name,
        order: sr.order,
        accent: sr.accent,
        category: sr.category,
      })
    }
  })

  it('gives every product a unique position', () => {
    const orders = SLUGS.map((slug) => doc('sr', slug).order)
    expect(new Set(orders).size).toBe(orders.length)
  })

  it('keeps Urinord out of the supplement category and carries its notice', () => {
    // Urinord is food for special medical purposes, not a supplement, and the
    // medical-supervision notice is mandatory on it.
    for (const locale of LOCALES) {
      const urinord = doc(locale, 'urinord')
      expect(urinord.category).toBe('fsmp')
      expect(urinord.regulatoryNote).toMatch(/pod medicinskim nadzorom/)
    }
  })

  it('leaves the five supplements without a medical-supervision notice', () => {
    for (const locale of LOCALES) {
      for (const slug of SLUGS) {
        if (slug === 'urinord') continue
        expect(doc(locale, slug).category, slug).toBe('supplement')
        expect(doc(locale, slug).regulatoryNote, slug).toBe('')
      }
    }
  })

  it('preserves Serbian diacritics and stays in Latin script', () => {
    const serbian = SLUGS.map((slug) => JSON.stringify(doc('sr', slug))).join('')
    expect(serbian).toMatch(/[šđčćžŠĐČĆŽ]/)
    expect(serbian).not.toMatch(/[Ѐ-ӿ]/)
  })
})
