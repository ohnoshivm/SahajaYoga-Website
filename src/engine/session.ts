export const LAPS_PER_ROUND = 10

/** One entry in the append-only log. `at` is elapsed ms when it happened. */
export type SessionEvent = { kind: 'lap' | 'round'; at: number }

export type SessionState = {
  chakra: string
  /** Append-only log of real lap taps and next-round presses. Undo pops the last entry. */
  events: SessionEvent[]
  /** Elapsed ms banked while paused or before the current run. */
  banked: number
  /** performance/Date timestamp of the current run start, or null when not running. */
  runStart: number | null
  ended: boolean
}

export type SessionAction =
  | { type: 'tap'; now: number }
  | { type: 'next'; now: number }
  | { type: 'undo'; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'end'; now: number }
  | { type: 'reset'; chakra?: string }

export function createSession(chakra: string): SessionState {
  return { chakra, events: [], banked: 0, runStart: null, ended: false }
}

export function elapsed(s: SessionState, now: number): number {
  return s.banked + (s.runStart === null ? 0 : Math.max(0, now - s.runStart))
}

export type Progress = {
  /** Real lap taps only. */
  taps: number
  /** Lap within the current round: 0 at the start of a round, up to 10. */
  lap: number
  /** Current round number, starting at 1. */
  round: number
  /** Elapsed ms at which each round closed. Length = rounds completed. */
  splits: number[]
}

/** Folds the event log into the numbers the screen shows. */
export function progress(s: SessionState): Progress {
  let taps = 0
  let lap = 0
  let round = 1
  const splits: number[] = []
  for (const e of s.events) {
    if (e.kind === 'lap') {
      if (lap === LAPS_PER_ROUND) {
        round++
        lap = 0
      }
      taps++
      lap++
      if (lap === LAPS_PER_ROUND) splits.push(e.at)
    } else if (lap > 0) {
      if (lap < LAPS_PER_ROUND) splits.push(e.at)
      round++
      lap = 0
    }
  }
  return { taps, lap, round, splits }
}

export function lastSplit(p: Progress): number {
  return p.splits.length ? p.splits[p.splits.length - 1] : 0
}

export function sessionReducer(s: SessionState, a: SessionAction): SessionState {
  switch (a.type) {
    case 'tap': {
      if (s.ended) return s
      const runStart = s.runStart ?? a.now
      const next = { ...s, runStart }
      next.events = [...s.events, { kind: 'lap', at: elapsed(next, a.now) }]
      return next
    }
    case 'next': {
      // Needs at least one lap in the current round: no empty rounds, no duplicates.
      if (s.ended || progress(s).lap === 0) return s
      return { ...s, events: [...s.events, { kind: 'round', at: elapsed(s, a.now) }] }
    }
    case 'undo':
      if (s.ended || s.events.length === 0) return s
      return { ...s, events: s.events.slice(0, -1) }
    case 'pause':
      if (s.runStart === null || s.ended) return s
      return { ...s, banked: elapsed(s, a.now), runStart: null }
    case 'resume':
      if (s.runStart !== null || s.ended || s.events.length === 0) return s
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
