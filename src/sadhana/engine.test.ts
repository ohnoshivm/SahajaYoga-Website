import { describe, expect, it } from 'vitest'
import { completed, IDLE, sitElapsed, sitReducer, type SitAction, type SitState } from './engine'
import type { Step } from './types'

const STEPS: Step[] = [
  { kind: 'prepare', on: true },
  { kind: 'silence', on: true, chakra: 'sahasrara', minutes: 5 },
  { kind: 'close', on: true },
]

const run = (actions: SitAction[], from: SitState = IDLE) => actions.reduce(sitReducer, from)
const begun = () => run([{ type: 'begin', steps: STEPS, now: 1000 }])

describe('sitting engine', () => {
  it('begins at the first step, running', () => {
    const s = begun()
    expect(s.index).toBe(0)
    expect(s.runStart).toBe(1000)
    expect(s.ended).toBe(false)
  })

  it('ignores an empty sitting', () => {
    expect(run([{ type: 'begin', steps: [], now: 0 }])).toBe(IDLE)
  })

  it('advances on done and logs the time', () => {
    const s = run([{ type: 'done', now: 4000 }], begun())
    expect(s.index).toBe(1)
    expect(s.log).toEqual([{ kind: 'done', step: 0, at: 3000 }])
  })

  it('ends after the last step is done, banking the time', () => {
    const s = run([{ type: 'done', now: 2000 }, { type: 'done', now: 3000 }, { type: 'done', now: 5000 }], begun())
    expect(s.ended).toBe(true)
    expect(s.banked).toBe(4000)
    expect(s.runStart).toBeNull()
    expect([...completed(s)]).toEqual([0, 1, 2])
  })

  it('skip moves on without counting the step as completed', () => {
    const s = run([{ type: 'skip', now: 2000 }], begun())
    expect(s.index).toBe(1)
    expect(completed(s).size).toBe(0)
  })

  it('back goes to the previous step but not before the first', () => {
    let s = run([{ type: 'back', now: 1500 }], begun())
    expect(s.index).toBe(0)
    expect(s.log).toHaveLength(0)
    s = run([{ type: 'done', now: 2000 }, { type: 'back', now: 3000 }], begun())
    expect(s.index).toBe(0)
  })

  it('jumps to any valid step', () => {
    const s = run([{ type: 'jump', to: 2, now: 2000 }], begun())
    expect(s.index).toBe(2)
    expect(run([{ type: 'jump', to: 9, now: 2000 }], begun()).index).toBe(0)
  })

  it('pauses and resumes the clock', () => {
    let s = run([{ type: 'pause', now: 3000 }], begun())
    expect(s.banked).toBe(2000)
    expect(sitElapsed(s, 9000)).toBe(2000)
    s = run([{ type: 'resume', now: 10_000 }], s)
    expect(sitElapsed(s, 11_000)).toBe(3000)
  })

  it('end stops the sitting where it is', () => {
    const s = run([{ type: 'done', now: 2000 }, { type: 'end', now: 6000 }], begun())
    expect(s.ended).toBe(true)
    expect(s.index).toBe(1)
    expect(s.banked).toBe(5000)
  })

  it('does nothing after the end except reset', () => {
    const ended = run([{ type: 'end', now: 2000 }], begun())
    expect(run([{ type: 'done', now: 3000 }], ended)).toBe(ended)
    expect(run([{ type: 'reset' }], ended)).toBe(IDLE)
  })
})
