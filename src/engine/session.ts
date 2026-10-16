export const LAPS_PER_ROUND = 10

export type SessionState = {
  chakra: string
  taps: number
  /** Elapsed ms banked while paused or before the current run. */
  banked: number
  /** performance/Date timestamp of the current run start, or null when not running. */
  runStart: number | null
  /** Elapsed ms at the moment each round completed. */
  splits: number[]
  ended: boolean
}

export type SessionAction =
  | { type: 'tap'; now: number }
  | { type: 'undo'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'end'; now: number }
  | { type: 'reset'; chakra?: string }

export function createSession(chakra: string): SessionState {
  return { chakra, taps: 0, banked: 0, runStart: null, splits: [], ended: false }
}

export function elapsed(s: SessionState, now: number): number {
  return s.banked + (s.runStart === null ? 0 : Math.max(0, now - s.runStart))
}

/** Lap within the current round, 0 before the first tap, otherwise 1..10. */
export function lapInRound(taps: number): number {
  return taps === 0 ? 0 : ((taps - 1) % LAPS_PER_ROUND) + 1
}

/** Current round number, starting at 1. Tap 11 begins round 2. */
export function currentRound(taps: number): number {
  return taps === 0 ? 1 : Math.floor((taps - 1) / LAPS_PER_ROUND) + 1
}

export function roundsCompleted(taps: number): number {
  return Math.floor(taps / LAPS_PER_ROUND)
}

export function sessionReducer(s: SessionState, a: SessionAction): SessionState {
  switch (a.type) {
    case 'tap': {
      if (s.ended) return s
      const runStart = s.runStart ?? a.now
      const taps = s.taps + 1
      const next = { ...s, taps, runStart }
      if (taps % LAPS_PER_ROUND === 0) next.splits = [...s.splits, elapsed(next, a.now)]
      return next
    }
    case 'undo': {
      if (s.ended || s.taps === 0) return s
      const splits = s.taps % LAPS_PER_ROUND === 0 ? s.splits.slice(0, -1) : s.splits
      return { ...s, taps: s.taps - 1, splits }
    }
    case 'pause':
      if (s.runStart === null || s.ended) return s
      return { ...s, banked: elapsed(s, a.now), runStart: null }
    case 'resume':
      if (s.runStart !== null || s.ended || s.taps === 0) return s
      return { ...s, runStart: a.now }
    case 'end':
      return { ...s, banked: elapsed(s, a.now), runStart: null, ended: true }
    case 'reset':
      return createSession(a.chakra ?? s.chakra)
  }
}

export function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const sec = total % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(sec).padStart(2, '0')
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`
}
