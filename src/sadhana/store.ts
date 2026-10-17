import { useEffect, useReducer } from 'react'
import { IDLE, sitElapsed, sitReducer, type SitState } from './engine'
import { PRESETS } from './library'
import type { Feeling, Sitting, Talk } from './types'

/** Everything here is per-device convenience; each read and write survives blocked storage. */
function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key)
    else localStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* storage unavailable */
  }
}

const K = {
  sittings: 'sy.sadhana.sittings',
  pick: 'sy.sadhana.pick',
  feeling: 'sy.sadhana.feeling',
  talk: 'sy.sadhana.talk',
  recent: 'sy.sadhana.talks',
  run: 'sy.sadhana.run',
  history: 'sy.sadhana.history',
}

// ── Sittings: presets, with any edits kept per preset ──

export function loadSittings(): Sitting[] {
  const edits = read<Record<string, Sitting>>(K.sittings, {})
  return PRESETS.map((p) => {
    const e = edits[p.id]
    return e && Array.isArray(e.steps) ? { ...p, steps: e.steps } : p
  })
}

export function saveSitting(s: Sitting) {
  const edits = read<Record<string, Sitting>>(K.sittings, {})
  write(K.sittings, { ...edits, [s.id]: s })
}

export function resetSitting(id: string): Sitting {
  const edits = read<Record<string, Sitting>>(K.sittings, {})
  delete edits[id]
  write(K.sittings, edits)
  return PRESETS.find((p) => p.id === id)!
}

export const loadPick = () => read<string>(K.pick, 'evening')
export const savePick = (id: string) => write(K.pick, id)
export const loadFeeling = () => read<Feeling>(K.feeling, 'balanced')
export const saveFeeling = (f: Feeling) => write(K.feeling, f)

// ── Talks ──

export const loadTalk = () => read<Talk | null>(K.talk, null)
export const saveTalk = (t: Talk | null) => write(K.talk, t)
export const loadRecentTalks = () => read<Talk[]>(K.recent, [])

export function rememberTalk(t: Talk) {
  const list = loadRecentTalks().filter((x) => x.id !== t.id)
  write(K.recent, [t, ...list].slice(0, 5))
}

// ── The running sitting ──

function loadRun(): SitState {
  const s = read<SitState | null>(K.run, null)
  const valid = !!s && Array.isArray(s.steps) && s.steps.length > 0 && Number.isInteger(s.index) && s.index < s.steps.length && !s.ended
  // Resume paused: performance.now() restarts with the page.
  return valid ? { ...s!, runStart: null } : IDLE
}

export function useSitting() {
  const [state, dispatch] = useReducer(sitReducer, undefined, loadRun)

  useEffect(() => {
    const save = () => write(K.run, state.steps.length && !state.ended ? { ...state, banked: sitElapsed(state, performance.now()), runStart: null } : null)
    save()
    const id = state.runStart !== null ? window.setInterval(save, 5000) : undefined
    const onHide = () => document.visibilityState === 'hidden' && save()
    addEventListener('pagehide', save)
    document.addEventListener('visibilitychange', onHide)
    return () => {
      if (id) clearInterval(id)
      removeEventListener('pagehide', save)
      document.removeEventListener('visibilitychange', onHide)
    }
  }, [state])

  return [state, dispatch] as const
}

export type SavedSitting = { endedAt: number; durationMs: number; steps: number; completed: number; titles: string[] }

export function saveSittingHistory(entry: SavedSitting) {
  const list = read<SavedSitting[]>(K.history, [])
  write(K.history, [entry, ...list].slice(0, 300))
}
