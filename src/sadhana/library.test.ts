import { describe, expect, it } from 'vitest'
import { CHANTS } from './chants'
import { plan, PRESETS, totalMinutes } from './library'
import type { Sitting } from './types'

const sitting = (steps: Sitting['steps']): Sitting => ({ id: 't', name: 'T', note: '', steps })

describe('plan', () => {
  it('drops switched-off steps', () => {
    const s = sitting([{ kind: 'prepare', on: true }, { kind: 'close', on: false }])
    expect(plan(s, 'balanced', false).map((x) => x.kind)).toEqual(['prepare'])
  })

  it('runs the talk only with a link, and only once', () => {
    const s = sitting([{ kind: 'talk', on: true }, { kind: 'close', on: true }, { kind: 'talk', on: true }])
    expect(plan(s, 'balanced', false).map((x) => x.kind)).toEqual(['close'])
    expect(plan(s, 'balanced', true).map((x) => x.kind)).toEqual(['talk', 'close'])
  })

  it('adds the candle for a heavy left side and ice for the right, after the opening', () => {
    const s = sitting([{ kind: 'prepare', on: true }, { kind: 'close', on: true }])
    expect(plan(s, 'left', false)[1]).toEqual({ kind: 'remedy', on: true, remedy: 'candle' })
    expect(plan(s, 'right', false)[1]).toEqual({ kind: 'remedy', on: true, remedy: 'ice' })
  })

  it('does not add a clearing that is already there', () => {
    const s = sitting([{ kind: 'prepare', on: true }, { kind: 'remedy', on: true, remedy: 'ice' }])
    expect(plan(s, 'right', false)).toHaveLength(2)
  })
})

describe('library', () => {
  it('every preset estimates a sensible length', () => {
    for (const p of PRESETS) expect(totalMinutes(p.steps)).toBeGreaterThan(5)
  })

  it('chant timings run forward and stay inside each recording', () => {
    for (const c of Object.values(CHANTS)) {
      const times = c.verses.flatMap((v) => v.lines.map((l) => l.at)).filter((t): t is number => t !== undefined)
      expect(times.length).toBeGreaterThan(5)
      times.forEach((t, i) => {
        expect(t).toBeLessThan(c.duration)
        if (i) expect(t).toBeGreaterThan(times[i - 1])
      })
    }
  })

  it('word meanings spell out the transliterated line', () => {
    for (const c of Object.values(CHANTS))
      for (const v of c.verses)
        for (const l of v.lines) if (l.words) expect(l.words.map((w) => w.w).join(' ')).toBe(l.roman)
  })
})
