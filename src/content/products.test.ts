import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { LOCALES, type Locale } from '@/i18n/locales'
import { repoPath } from '@/test/paths'

type Doc = {
  name: string
  order: number
  family: string
  category: string
  regulatoryNote: string
  hero: { dose: string; pack: string; intro: string }
  ingredients: { items: { name: string; amount: string; role: string }[] }
  benefits: { items: { title: string; body: string }[] }
  useCases: { items: string[] }
  notes: { warnings: string; legalNote: string }
  [key: string]: unknown
}

function slugsIn(locale: Locale): string[] {
  return readdirSync(repoPath(`content/${locale}/products`))
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
    .sort()
}

function doc(locale: Locale, slug: string): Doc {
  return JSON.parse(readFileSync(repoPath(`content/${locale}/products/${slug}.json`), 'utf8')) as Doc
}

const SLUGS = slugsIn('sr')

describe('product content', () => {
  it('has the same products in every locale', () => {
    for (const locale of LOCALES) expect(slugsIn(locale)).toEqual(SLUGS)
  })

  it('ships a photo for every slug', () => {
    // The photo is derived from the slug rather than stored as a CMS field, so
    // a renamed product silently loses its image unless this holds.
    for (const slug of SLUGS) expect(existsSync(repoPath(`public/products/${slug}.webp`)), slug).toBe(true)
  })

  it('keeps name, order, family and category identical across locales', () => {
    for (const slug of SLUGS) {
      const sr = doc('sr', slug)
      const en = doc('en', slug)
      expect({ name: en.name, order: en.order, family: en.family, category: en.category }).toEqual({
        name: sr.name,
        order: sr.order,
        family: sr.family,
        category: sr.category,
      })
    }
  })

  it('keeps every repeating list the same length in both locales', () => {
    // The two locales share one schema factory, so the shapes cannot drift —
    // but the number of entries an editor types into an array still can, and a
    // benefit that exists only in Serbian is a half-translated page.
    for (const slug of SLUGS) {
      const sr = doc('sr', slug)
      const en = doc('en', slug)
      expect(en.ingredients.items.length, `${slug} ingredients`).toBe(sr.ingredients.items.length)
      expect(en.benefits.items.length, `${slug} benefits`).toBe(sr.benefits.items.length)
      expect(en.useCases.items.length, `${slug} use cases`).toBe(sr.useCases.items.length)
    }
  })

  it('names the same ingredients in both locales', () => {
    // Ingredient names are botanical or chemical and do not translate; they are
    // also the pills on the home card, so a mismatch shows up there first.
    for (const slug of SLUGS) {
      expect(doc('en', slug).ingredients.items.map((i) => i.name)).toEqual(
        doc('sr', slug).ingredients.items.map((i) => i.name),
      )
    }
  })

  it('fills every field the product page cannot render without', () => {
    for (const locale of LOCALES) {
      for (const slug of SLUGS) {
        const product = doc(locale, slug)
        for (const [what, value] of [
          ['intro', product.hero.intro],
          ['dose', product.hero.dose],
          ['pack', product.hero.pack],
          ['warnings', product.notes.warnings],
          ['legal note', product.notes.legalNote],
        ] as const) {
          expect(value, `${locale}/${slug} ${what}`).toBeTruthy()
        }
        expect(product.ingredients.items.length, `${locale}/${slug}`).toBeGreaterThan(0)
      }
    }
  })

  it('carries the mandated statement on every product', () => {
    // Five supplements take the supplement wording; Urinord is food for special
    // medical purposes and takes the medical-supervision wording instead.
    for (const slug of SLUGS) {
      const note = doc('sr', slug).notes.legalNote
      expect(note, slug).toMatch(
        slug === 'urinord' ? /pod medicinskim nadzorom/ : /^Dodaci ishrani nisu zamena/,
      )
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

describe('related products', () => {
  // Mirrors getRelatedProducts, over the content files rather than the reader.
  const family = (slug: string) => doc('sr', slug).family
  const ordered = [...SLUGS].sort((a, b) => doc('sr', a).order - doc('sr', b).order)

  const related = (slug: string) => {
    const others = ordered.filter((s) => s !== slug)
    if (family(slug) === 'regeneration') return others.slice(0, 3)
    return [
      ...others.filter((s) => family(s) === family(slug)),
      ...others.filter((s) => family(s) === 'regeneration'),
    ].slice(0, 3)
  }

  it('never shows a product beside itself', () => {
    for (const slug of SLUGS) expect(related(slug)).not.toContain(slug)
  })

  it('puts regeneration alongside every other area', () => {
    // Renord is a companion to a urology or gynaecology product, so it belongs
    // in both of their groups; on its own page every product is a sibling.
    for (const slug of SLUGS) {
      if (family(slug) === 'regeneration') continue
      expect(related(slug), slug).toContain('renord')
    }
    expect(related('renord')).toHaveLength(3)
  })

  it('keeps urology and gynaecology apart', () => {
    for (const slug of SLUGS) {
      if (family(slug) === 'regeneration') continue
      const opposite = family(slug) === 'urology' ? 'gynaecology' : 'urology'
      expect(related(slug).map(family), slug).not.toContain(opposite)
    }
  })

  it('never leaves a product without neighbours', () => {
    for (const slug of SLUGS) expect(related(slug).length, slug).toBeGreaterThanOrEqual(2)
  })
})
