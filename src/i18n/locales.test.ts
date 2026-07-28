import { describe, expect, it } from 'vitest'
import { DEFAULT_LOCALE, LOCALES, isLocale } from './locales'

describe('locales', () => {
  it('exposes sr and en, sr first', () => {
    expect(LOCALES).toEqual(['sr', 'en'])
  })

  it('defaults to sr', () => {
    expect(DEFAULT_LOCALE).toBe('sr')
  })

  it('accepts known locales', () => {
    expect(isLocale('sr')).toBe(true)
    expect(isLocale('en')).toBe(true)
  })

  it('rejects unknown locales, including near-misses', () => {
    expect(isLocale('SR')).toBe(false)
    expect(isLocale('sr-Latn')).toBe(false)
    expect(isLocale('de')).toBe(false)
    expect(isLocale('')).toBe(false)
  })
})
