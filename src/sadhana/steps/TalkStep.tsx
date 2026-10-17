import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { TalkController } from '../youtube'
import type { StepProps } from './common'

export function useTalkStatus(c: TalkController | null) {
  return useSyncExternalStore(
    (fn) => (c ? c.subscribe(fn) : () => {}),
    () => (c ? `${c.status}␟${c.title}` : 'idle␟'),
  ).split('␟') as [TalkController['status'], string]
}

/**
 * The talk's player is mounted by the sitting (so it can buffer early) and floats above the page.
 * This step lays out the space it should fill, under the title, and hands that box to the player
 * through CSS variables, so the two never overlap at any screen size.
 */
function usePlayerBox() {
  const box = useRef<HTMLDivElement>(null)
  useLayoutEffect(() => {
    const el = box.current
    if (!el) return
    const root = document.documentElement.style
    const place = () => {
      const r = el.getBoundingClientRect()
      root.setProperty('--talk-x', `${r.left}px`)
      root.setProperty('--talk-y', `${r.top}px`)
      root.setProperty('--talk-w', `${r.width}px`)
      root.setProperty('--talk-h', `${r.height}px`)
    }
    place()
    const ro = new ResizeObserver(place)
    ro.observe(el)
    addEventListener('resize', place)
    return () => {
      ro.disconnect()
      removeEventListener('resize', place)
      for (const k of ['--talk-x', '--talk-y', '--talk-w', '--talk-h']) root.removeProperty(k)
    }
  }, [])
  return box
}

export function TalkStep({ talk, active, paused, onDone, onProgress }: StepProps & { talk: TalkController | null }) {
  const [status, title] = useTalkStatus(talk)
  const [asked, setAsked] = useState(false)
  const box = usePlayerBox()

  useEffect(() => {
    if (!talk || !asked) return
    if (paused) talk.pause()
    else talk.play()
  }, [paused, talk, asked])

  useEffect(() => {
    if (status === 'ended') {
      onProgress(1)
      onDone()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  useEffect(() => {
    if (!talk || status !== 'playing') return
    const id = window.setInterval(() => onProgress(talk.progress()), 1000)
    return () => clearInterval(id)
  }, [talk, status, onProgress])

  // Leaving the step stops the talk.
  useEffect(() => () => talk?.pause(), [talk])

  // Called from the tap itself, so phones allow the sound.
  const begin = () => {
    setAsked(true)
    talk?.play()
  }

  const waiting = status === 'loading' || status === 'idle'

  return (
    <section className="st st-talk">
      <header className="st-talk-head">
        <h2 className="st-talk-title" title={title || undefined}>{title || 'Shri Mataji’s talk'}</h2>
        <p className="st-byline">Shri Mataji Nirmala Devi</p>
      </header>
      <div className="st-talk-slot">
        <div className="st-talk-box" ref={box} />
      </div>
      <div className="st-talk-foot">
        {status === 'error' ? (
          <p className="st-note">The talk couldn’t load. Check the link on the start screen, or go on to the next step.</p>
        ) : !asked ? (
          <button className="st-begin" onClick={begin} disabled={waiting || !active}>
            {waiting ? 'Loading the talk' : 'Begin the talk'}
          </button>
        ) : null}
      </div>
    </section>
  )
}
