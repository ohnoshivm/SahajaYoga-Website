import { useEffect, useReducer, useState } from 'react'
import { createSession, elapsed, sessionReducer, type SessionState } from '../engine/session'

const KEY = (slug: string) => `sy.session.${slug}`
const HISTORY = 'sy.history'

export type SavedSession = {
  chakra: string
  endedAt: number
  durationMs: number
  taps: number
  rounds: number
  splits: number[]
}

function load(slug: string): SessionState {
  try {
    const raw = localStorage.getItem(KEY(slug))
    if (raw) {
      const s = JSON.parse(raw) as SessionState
      if (s && s.chakra === slug && !s.ended) {
        // Resume paused: never count time the page was closed.
        return { ...s, banked: s.banked, runStart: null }
      }
    }
  } catch {
    /* storage unavailable */
  }
  return createSession(slug)
}

export function saveToHistory(s: SessionState) {
  if (s.taps === 0) return
  try {
    const list: SavedSession[] = JSON.parse(localStorage.getItem(HISTORY) ?? '[]')
    list.unshift({
      chakra: s.chakra,
      endedAt: Date.now(),
      durationMs: s.banked,
      taps: s.taps,
      rounds: Math.floor(s.taps / 10),
      splits: s.splits,
    })
    localStorage.setItem(HISTORY, JSON.stringify(list.slice(0, 500)))
  } catch {
    /* storage unavailable */
  }
}

export function useSession(slug: string) {
  const [state, dispatch] = useReducer(sessionReducer, slug, load)

  useEffect(() => {
    try {
      if (state.ended) localStorage.removeItem(KEY(slug))
      else localStorage.setItem(KEY(slug), JSON.stringify(state))
    } catch {
      /* storage unavailable */
    }
  }, [state, slug])

  return [state, dispatch] as const
}

/** Re-renders four times a second while the timer runs. */
export function useClock(state: SessionState) {
  const [now, setNow] = useState(() => performance.now())
  useEffect(() => {
    if (state.runStart === null) return
    const id = setInterval(() => setNow(performance.now()), 250)
    return () => clearInterval(id)
  }, [state.runStart])
  return elapsed(state, state.runStart === null ? 0 : now)
}
