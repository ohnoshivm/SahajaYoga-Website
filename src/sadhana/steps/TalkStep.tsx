import { useEffect, useState, useSyncExternalStore } from 'react'
import type { TalkController } from '../youtube'
import type { StepProps } from './common'

export function useTalkStatus(c: TalkController | null) {
  return useSyncExternalStore(
    (fn) => (c ? c.subscribe(fn) : () => {}),
    () => (c ? `${c.status}␟${c.title}` : 'idle␟'),
  ).split('␟') as [TalkController['status'], string]
}

/** The talk's frame is mounted by the sitting (so it can buffer early); this step shows it. */
export function TalkStep({ talk, active, paused, onDone, onProgress }: StepProps & { talk: TalkController | null }) {
  const [status, title] = useTalkStatus(talk)
  const [asked, setAsked] = useState(false)

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
  const showBegin = active && !asked && status !== 'error'

  return (
    <section className={`st st-talk ${asked ? 'is-playing' : ''}`}>
      <header className="st-talk-head">
        <h2 className="st-talk-title">{title || 'Shri Mataji’s talk'}</h2>
        <p className="st-byline">Shri Mataji Nirmala Devi</p>
      </header>
      {showBegin && (
        <button className="st-begin" onClick={begin} disabled={waiting}>
          {waiting ? 'Loading the talk' : 'Begin the talk'}
        </button>
      )}
      {status === 'error' && (
        <p className="st-note">The talk couldn’t load. Check the link on the start screen, or go on to the next step.</p>
      )}
    </section>
  )
}
