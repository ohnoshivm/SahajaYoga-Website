import { useEffect, useReducer, useState } from 'react'
import { createSession, elapsed, progress, sessionReducer, type SessionState } from '../engine/session'

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
      const valid =
        !!s && s.chakra === slug && !s.ended && Array.isArray(s.events) && typeof s.banked === 'number' &&
        s.events.every((e) => e && (e.kind === 'lap' || e.kind === 'round') && typeof e.at === 'number')
      if (valid) {
        // Resume paused, never counting time the page was closed. Older saves could
        // hold less banked time than their last event; never let the clock run behind it.
        const last = s.events.length ? s.events[s.events.length - 1].at : 0
        return { ...s, banked: Math.max(s.banked, last), runStart: null }
      }
    }
  } catch {
    /* storage unavailable */
  }
  return createSession(slug)
}

export function saveToHistory(s: SessionState) {
  const p = progress(s)
  if (p.taps === 0) return
  try {
    const list: SavedSession[] = JSON.parse(localStorage.getItem(HISTORY) ?? '[]')
    list.unshift({
      chakra: s.chakra,
      endedAt: Date.now(),
      durationMs: s.banked,
      taps: p.taps,
      rounds: p.splits.length,
      splits: p.splits,
    })
    localStorage.setItem(HISTORY, JSON.stringify(list.slice(0, 500)))
  } catch {
    /* storage unavailable */
  }
}

export function useSession(slug: string) {
  const [state, dispatch] = useReducer(sessionReducer, slug, load)

  // Save a paused snapshot with the time banked: performance.now() restarts on reload,
  // so a stored runStart would be meaningless and the clock would fall behind the splits.
  useEffect(() => {
    const save = () => {
      try {
        if (state.ended) localStorage.removeItem(KEY(slug))
        else localStorage.setItem(KEY(slug), JSON.stringify({ ...state, banked: elapsed(state, performance.now()), runStart: null }))
      } catch {
        /* storage unavailable */
      }
    }
    save()
    // Keep the banked time fresh while running, and catch the moment the page is left.
    const id = state.runStart !== null ? setInterval(save, 5000) : undefined
    const onHide = () => document.visibilityState === 'hidden' && save()
    addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      if (id) clearInterval(id)
      removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', onHide)
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
