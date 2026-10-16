import { describe, expect, it } from 'vitest'
import {
  createSession, elapsed, formatTime, lastSplit, LAPS_PER_ROUND, progress, sessionReducer,
  type SessionState,
} from './session'

const tapN = (s: SessionState, n: number, start = 0, step = 1000) => {
  for (let i = 0; i < n; i++) s = sessionReducer(s, { type: 'tap', now: start + i * step })
  return s
}
const next = (s: SessionState, now: number) => sessionReducer(s, { type: 'next', now })
const undo = (s: SessionState, now = 0) => sessionReducer(s, { type: 'undo', now })
const fresh = () => createSession('mooladhara')

describe('10 laps per round', () => {
  it('starts at lap 0, round 1', () => {
    expect(progress(fresh())).toEqual({ taps: 0, lap: 0, round: 1, splits: [] })
  })
  it('tap 10 completes round 1 and shows 10/10', () => {
    const p = progress(tapN(fresh(), 10))
    expect(p.lap).toBe(LAPS_PER_ROUND)
    expect(p.round).toBe(1)
    expect(p.splits).toHaveLength(1)
  })
  it('tap 11 starts lap 1 of round 2', () => {
    const p = progress(tapN(fresh(), 11))
    expect(p.lap).toBe(1)
    expect(p.round).toBe(2)
    expect(p.taps).toBe(11)
  })
  it('records a split at every 10th tap', () => {
    expect(progress(tapN(fresh(), 30)).splits).toEqual([9000, 19000, 29000])
  })
})

describe('next round', () => {
  it('mid-round records a split and resets the lap', () => {
    const s = next(tapN(fresh(), 4), 5000)
    const p = progress(s)
    expect(p).toEqual({ taps: 4, lap: 0, round: 2, splits: [5000] })
    expect(lastSplit(p)).toBe(5000)
  })
  it('next lap after it is lap 1 of the new round', () => {
    const p = progress(tapN(next(tapN(fresh(), 4), 5000), 1, 6000))
    expect(p.lap).toBe(1)
    expect(p.round).toBe(2)
  })
  it('does nothing at lap 0 / before any tap', () => {
    const s = fresh()
    expect(next(s, 100)).toBe(s)
  })
  it('does nothing twice in a row', () => {
    const once = next(tapN(fresh(), 3), 4000)
    expect(next(once, 5000)).toBe(once)
  })
  it('at 10/10 moves on without a second split', () => {
    const done = tapN(fresh(), 10)
    const s = next(done, 11000)
    const p = progress(s)
    expect(p.splits).toEqual([9000])
    expect(p.lap).toBe(0)
    expect(p.round).toBe(2)
    expect(next(s, 12000)).toBe(s)
  })
  it('total laps exclude phantom laps', () => {
    let s = tapN(fresh(), 4)
    s = next(s, 5000)
    s = tapN(s, 10, 6000)
    s = next(s, 20000)
    s = tapN(s, 2, 21000)
    expect(progress(s).taps).toBe(16)
    expect(progress(s).splits).toHaveLength(2)
  })
  it('ignored after the session ends', () => {
    const s = sessionReducer(tapN(fresh(), 3), { type: 'end', now: 4000 })
    expect(next(s, 5000)).toBe(s)
  })
})

describe('undo', () => {
  it('removes the last tap and the split it created', () => {
    const p = progress(undo(tapN(fresh(), 10)))
    expect(p.taps).toBe(9)
    expect(p.splits).toHaveLength(0)
  })
  it('does nothing at zero', () => {
    const s = fresh()
    expect(undo(s)).toBe(s)
  })
  it('reverses a next-round and its split', () => {
    const s = undo(next(tapN(fresh(), 4), 5000))
    expect(progress(s)).toEqual({ taps: 4, lap: 4, round: 1, splits: [] })
  })
  it('undoing a next-round at 10/10 keeps the lap-10 split', () => {
    const s = undo(next(tapN(fresh(), 10), 11000))
    expect(progress(s)).toEqual({ taps: 10, lap: 10, round: 1, splits: [9000] })
  })
  it('undo after a next-round then a lap removes only the lap', () => {
    const s = undo(tapN(next(tapN(fresh(), 4), 5000), 1, 6000))
    expect(progress(s)).toEqual({ taps: 4, lap: 0, round: 2, splits: [5000] })
  })
})

describe('timer', () => {
  it('starts on the first tap and pauses/resumes', () => {
    let s = sessionReducer(createSession('mooladhara'), { type: 'tap', now: 1000 })
    expect(elapsed(s, 4000)).toBe(3000)
    s = sessionReducer(s, { type: 'pause', now: 4000 })
    expect(elapsed(s, 9000)).toBe(3000)
    s = sessionReducer(s, { type: 'resume', now: 9000 })
    expect(elapsed(s, 10000)).toBe(4000)
  })
  it('end freezes time and ignores taps', () => {
    let s = tapN(createSession('mooladhara'), 3)
    s = sessionReducer(s, { type: 'end', now: 5000 })
    s = sessionReducer(s, { type: 'tap', now: 6000 })
    expect(progress(s).taps).toBe(3)
    expect(elapsed(s, 99999)).toBe(5000)
  })
  it('formats', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(65000)).toBe('01:05')
    expect(formatTime(3725000)).toBe('1:02:05')
  })
})
