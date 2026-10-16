import { describe, expect, it } from 'vitest'
import {
  createSession, currentRound, elapsed, formatTime, lapInRound, roundsCompleted, sessionReducer,
  type SessionState,
} from './session'

const tapN = (s: SessionState, n: number, start = 0, step = 1000) => {
  for (let i = 0; i < n; i++) s = sessionReducer(s, { type: 'tap', now: start + i * step })
  return s
}

describe('10 laps per round', () => {
  it('starts at lap 0, round 1', () => {
    expect(lapInRound(0)).toBe(0)
    expect(currentRound(0)).toBe(1)
  })
  it('tap 10 completes round 1 and shows 10/10', () => {
    const s = tapN(createSession('mooladhara'), 10)
    expect(lapInRound(s.taps)).toBe(10)
    expect(currentRound(s.taps)).toBe(1)
    expect(roundsCompleted(s.taps)).toBe(1)
    expect(s.splits).toHaveLength(1)
  })
  it('tap 11 starts lap 1 of round 2', () => {
    const s = tapN(createSession('mooladhara'), 11)
    expect(lapInRound(s.taps)).toBe(1)
    expect(currentRound(s.taps)).toBe(2)
  })
  it('records a split at every 10th tap', () => {
    const s = tapN(createSession('mooladhara'), 30)
    expect(s.splits).toEqual([9000, 19000, 29000])
  })
})

describe('undo', () => {
  it('removes the last tap and the split it created', () => {
    let s = tapN(createSession('mooladhara'), 10)
    s = sessionReducer(s, { type: 'undo', now: 10000 })
    expect(s.taps).toBe(9)
    expect(s.splits).toHaveLength(0)
  })
  it('does nothing at zero', () => {
    const s = sessionReducer(createSession('mooladhara'), { type: 'undo', now: 0 })
    expect(s.taps).toBe(0)
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
    expect(s.taps).toBe(3)
    expect(elapsed(s, 99999)).toBe(5000)
  })
  it('formats', () => {
    expect(formatTime(0)).toBe('00:00')
    expect(formatTime(65000)).toBe('01:05')
    expect(formatTime(3725000)).toBe('1:02:05')
  })
})
