import { describe, expect, it } from 'vitest'
import { clampDescription } from './seo'

const LIMIT = 155

describe('clampDescription', () => {
  it('leaves a short description alone', () => {
    expect(clampDescription('Nordogen razvija dodatke ishrani.')).toBe(
      'Nordogen razvija dodatke ishrani.',
    )
  })

  it('collapses whitespace', () => {
    expect(clampDescription('a\n  b\tc')).toBe('a b c')
  })

  it('ends on a sentence when one is in range', () => {
    const text = `${'x'.repeat(100)}. ${'y'.repeat(200)}`
    const out = clampDescription(text)
    expect(out).toBe(`${'x'.repeat(100)}.`)
    expect(out).not.toContain('…')
  })

  it('falls back to a word boundary, never mid-word', () => {
    const text = Array.from({ length: 40 }, (_, i) => `word${i}`).join(' ')
    const out = clampDescription(text)
    expect(out.endsWith('…')).toBe(true)
    // Everything before the ellipsis is a whole word from the source.
    const words = out.slice(0, -1).trim().split(' ')
    for (const word of words) expect(text.split(' ')).toContain(word)
  })

  it('stays within the limit', () => {
    const text = 'a'.repeat(50) + ' ' + 'b'.repeat(400)
    expect(clampDescription(text).length).toBeLessThanOrEqual(LIMIT + 1)
  })

  it('does not leave a dangling comma before the ellipsis', () => {
    const text = `${'w'.repeat(140)}, ${'z'.repeat(80)}`
    expect(clampDescription(text)).not.toContain(',…')
  })
})
