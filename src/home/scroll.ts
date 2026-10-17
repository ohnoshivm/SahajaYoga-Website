import { useEffect, useRef } from 'react'
import Lenis from 'lenis'
import { CHAPTERS } from './data'

/**
 * One number drives the whole page: `t`, the journey position.
 *  -1 = the hero at the top · 0 = the first chapter · CHAPTERS.length - 1 = the last.
 * The scene and the text both read it every frame, so they can never drift apart.
 */
export const HERO_VH = 1.1
export const CHAPTER_VH = 1.2
export const LAST = CHAPTERS.length - 1
/** Scroll length of the hero and the journey, in viewport heights, before the footer. */
export const TOTAL_VH = HERO_VH + LAST * CHAPTER_VH + 1

export function chapterAt(scrollY: number, vh: number): number {
  if (!(vh > 0)) return -1
  const s = scrollY / vh
  return s < HERO_VH ? s / HERO_VH - 1 : (s - HERO_VH) / CHAPTER_VH
}

export function scrollFor(t: number, vh: number): number {
  return (t < 0 ? (t + 1) * HERO_VH : HERO_VH + t * CHAPTER_VH) * vh
}

export const journey = {
  /** Where the page is now (already smoothed by Lenis). */
  t: -1,
  /** Pointer, -1..1, for the hero lotus. */
  pointer: [0, 0] as [number, number],
  reduced: false,
}

export const smoothstep = (a: number, b: number, x: number) => {
  const k = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return k * k * (3 - 2 * k)
}

let lenis: Lenis | null = null

/** Smooth scrolling for the home page; native scrolling when motion is reduced. */
export function useSmoothScroll() {
  useEffect(() => {
    journey.reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (journey.reduced) return
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, touchMultiplier: 1.4 })
    let id = 0
    const raf = (time: number) => {
      lenis?.raf(time)
      id = requestAnimationFrame(raf)
    }
    id = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(id)
      lenis?.destroy()
      lenis = null
    }
  }, [])
}

export function goTo(t: number, immediate = false) {
  const y = scrollFor(t, innerHeight)
  if (lenis) lenis.scrollTo(y, immediate ? { immediate: true, force: true } : { duration: 1.6, easing: (x) => 1 - Math.pow(1 - x, 4) })
  else scrollTo({ top: y, behavior: immediate || journey.reduced ? 'auto' : 'smooth' })
}

/** `?t=5` holds the journey at a position without scrolling: for review links and renders. */
const held = (() => {
  if (typeof location === 'undefined') return null
  const v = parseFloat(new URLSearchParams(location.search).get('t') ?? '')
  return Number.isFinite(v) ? v : null
})()

/** Calls fn every frame with the current journey position. */
export function useJourneyFrame(fn: (t: number) => void) {
  const ref = useRef(fn)
  ref.current = fn
  useEffect(() => {
    let id = 0
    const loop = () => {
      id = requestAnimationFrame(loop)
      const t = held ?? chapterAt(scrollY, innerHeight)
      if (!Number.isFinite(t)) return
      journey.t = t
      ref.current(t)
    }
    id = requestAnimationFrame(loop)
    const onMove = (e: PointerEvent) => {
      journey.pointer = [(e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1]
    }
    addEventListener('pointermove', onMove, { passive: true })
    return () => {
      cancelAnimationFrame(id)
      removeEventListener('pointermove', onMove)
    }
  }, [])
}
