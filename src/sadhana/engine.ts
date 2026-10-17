import type { Step } from './types'

/**
 * The sitting engine: the same append-only idea as the mantra session, one level up.
 * Every move between steps is logged, so the summary and resume-after-reload fold out of it.
 */
export type SitEvent = { kind: 'done' | 'skip' | 'back' | 'jump'; step: number; at: number }

export type SitState = {
  /** The steps that were on when the sitting began, in order. */
  steps: Step[]
  index: number
  log: SitEvent[]
  /** Elapsed ms banked while paused or before the current run. */
  banked: number
  runStart: number | null
  ended: boolean
}

export type SitAction =
  | { type: 'begin'; steps: Step[]; now: number }
  | { type: 'done'; now: number }
  | { type: 'skip'; now: number }
  | { type: 'back'; now: number }
  | { type: 'jump'; to: number; now: number }
  | { type: 'pause'; now: number }
  | { type: 'resume'; now: number }
  | { type: 'end'; now: number }
  | { type: 'reset' }

export const IDLE: SitState = { steps: [], index: 0, log: [], banked: 0, runStart: null, ended: false }

export function sitElapsed(s: SitState, now: number): number {
  return s.banked + (s.runStart === null ? 0 : Math.max(0, now - s.runStart))
}

/** Steps completed (not skipped), counted once each. */
export function completed(s: SitState): Set<number> {
  const done = new Set<number>()
  for (const e of s.log) if (e.kind === 'done') done.add(e.step)
  return done
}

function move(s: SitState, kind: SitEvent['kind'], to: number, now: number): SitState {
  const at = sitElapsed(s, now)
  const log = [...s.log, { kind, step: s.index, at }]
  if (to >= s.steps.length) return { ...s, log, banked: at, runStart: null, ended: true }
  return { ...s, log, index: Math.max(0, to) }
}

export function sitReducer(s: SitState, a: SitAction): SitState {
  switch (a.type) {
    case 'begin':
      if (!a.steps.length) return s
      return { steps: a.steps, index: 0, log: [], banked: 0, runStart: a.now, ended: false }
    case 'done':
      if (s.ended || !s.steps.length) return s
      return move(s, 'done', s.index + 1, a.now)
    case 'skip':
      if (s.ended || !s.steps.length) return s
      return move(s, 'skip', s.index + 1, a.now)
    case 'back':
      if (s.ended || s.index === 0) return s
      return move(s, 'back', s.index - 1, a.now)
    case 'jump':
      if (s.ended || a.to === s.index || a.to < 0 || a.to >= s.steps.length) return s
      return move(s, 'jump', a.to, a.now)
    case 'pause':
      if (s.runStart === null || s.ended) return s
      return { ...s, banked: sitElapsed(s, a.now), runStart: null }
    case 'resume':
      if (s.runStart !== null || s.ended || !s.steps.length) return s
      return { ...s, runStart: a.now }
    case 'end':
      if (!s.steps.length || s.ended) return s
      return { ...s, banked: sitElapsed(s, a.now), runStart: null, ended: true }
    case 'reset':
      return IDLE
  }
}
