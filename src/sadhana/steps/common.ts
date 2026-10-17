import { useEffect, useRef, useState } from 'react'
import type { Feeling } from '../types'

/** What every step screen receives from the sitting. */
export type StepProps = {
  /** False while the step's title card is showing. */
  active: boolean
  paused: boolean
  feeling: Feeling
  /** The step is complete; the sitting shows what comes next, then moves on. */
  onDone: () => void
  /** 0–1 through this step, drawn live on the rail. */
  onProgress: (fraction: number) => void
}

/**
 * Counts down while running, from elapsed deltas so a throttled background tab
 * still lands on time. Calls onEnd once at zero.
 */
export function useCountdown(totalMs: number, running: boolean, onEnd: () => void) {
  const left = useRef(totalMs)
  const [shown, setShown] = useState(totalMs)
  const end = useRef(onEnd)
  end.current = onEnd

  useEffect(() => {
    if (!running || left.current <= 0) return
    let last = performance.now()
    const id = window.setInterval(() => {
      const now = performance.now()
      left.current = Math.max(0, left.current - (now - last))
      last = now
      setShown(left.current)
      if (left.current === 0) {
        clearInterval(id)
        end.current()
      }
    }, 200)
    return () => clearInterval(id)
  }, [running])

  return shown
}

/** Space counts; buttons, links and fields keep their own behaviour. */
export function useSpace(enabled: boolean, fn: () => void) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== ' ' || e.repeat) return
      if (e.target instanceof HTMLElement && e.target.closest('button, a, input, select, textarea')) return
      e.preventDefault()
      ref.current()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [enabled])
}

export function isControl(e: React.SyntheticEvent) {
  return e.target instanceof HTMLElement && !!e.target.closest('button, a, input, select, textarea')
}

export type Ripple = { id: number; x: number; y: number }

/** A ring where the finger lands: the same acknowledgement as the mantra screen. */
export function useRipples() {
  const [ripples, setRipples] = useState<Ripple[]>([])
  const spawn = (e: React.PointerEvent) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const id = performance.now()
    setRipples((r) => [...r.slice(-4), { id, x: e.clientX, y: e.clientY }])
    window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 1000)
  }
  return [ripples, spawn] as const
}

/** Runs fn after ms, unless the step goes away first. */
export function useDelay() {
  const ids = useRef<number[]>([])
  useEffect(() => () => ids.current.forEach(clearTimeout), [])
  return (fn: () => void, ms: number) => {
    ids.current.push(window.setTimeout(fn, ms))
  }
}

/** A light touch on phones for each count. The bells belong to the mantra laps only. */
export function haptic(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern)
  } catch {
    /* unsupported */
  }
}
