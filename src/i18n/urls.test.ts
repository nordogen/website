import { describe, expect, it } from 'vitest'
import { absoluteUrl, localeAlternates } from './urls'

describe('absoluteUrl', () => {
  it('prefixes the locale', () => {
    expect(absoluteUrl('sr')).toBe('https://nordogen.com/sr')
    expect(absoluteUrl('en')).toBe('https://nordogen.com/en')
  })

  it('appends a path', () => {
    expect(absoluteUrl('sr', '/products')).toBe('https://nordogen.com/sr/products')
  })

  it('normalises a missing leading slash', () => {
    expect(absoluteUrl('sr', 'products')).toBe('https://nordogen.com/sr/products')
  })

  it('never emits a trailing slash', () => {
    expect(absoluteUrl('en', '/')).toBe('https://nordogen.com/en')
  })

  // The root-path case above passes even if trailing-slash stripping is broken,
  // because the `suffix === '/'` guard already reduces it to ''. This case is
  // what actually pins the stripping behaviour.
  it('strips a trailing slash from a multi-segment path', () => {
    expect(absoluteUrl('sr', '/products/')).toBe('https://nordogen.com/sr/products')
  })
})

describe('localeAlternates', () => {
  it('lists both locales plus x-default pointing at sr', () => {
    expect(localeAlternates('/about').languages).toEqual({
      sr: 'https://nordogen.com/sr/about',
      en: 'https://nordogen.com/en/about',
      'x-default': 'https://nordogen.com/sr/about',
    })
  })

  it('supplies the canonical for a given locale', () => {
    expect(localeAlternates('/about').canonicalFor('en')).toBe(
      'https://nordogen.com/en/about',
    )
  })
})
