import { describe, expect, it } from 'vitest'
import { chapterAt, LAST, scrollFor, TOTAL_VH } from './scroll'

describe('journey position', () => {
  const vh = 900

  it('starts at the hero and reaches the first chapter after it', () => {
    expect(chapterAt(0, vh)).toBe(-1)
    expect(chapterAt(scrollFor(0, vh), vh)).toBeCloseTo(0)
  })

  it('round-trips every chapter', () => {
    for (let i = -1; i <= LAST; i += 0.5) expect(chapterAt(scrollFor(i, vh), vh)).toBeCloseTo(i)
  })

  it('leaves room for the last chapter to sit before the footer', () => {
    expect(scrollFor(LAST, vh)).toBeLessThan(TOTAL_VH * vh - vh + 1)
  })
})
