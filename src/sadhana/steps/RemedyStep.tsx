import { useEffect, useState } from 'react'
import { formatTime } from '../../engine/session'
import { PRACTICES } from '../library'
import { useCountdown, type StepProps } from './common'

const SIDE = { left: 'Left side', right: 'Right side', centre: 'Centre', all: 'Both sides' } as const

/** A guided practice, its instructions walking forward across the timer. */
export function RemedyStep({ remedy, minutes, active, paused, onDone, onProgress }: StepProps & { remedy: string; minutes?: number }) {
  const p = PRACTICES[remedy]
  const total = (minutes ?? p?.minutes ?? 5) * 60_000
  const [complete, setComplete] = useState(false)

  const left = useCountdown(total, active && !paused, () => {
    setComplete(true)
    onDone()
  })

  const progress = 1 - left / total
  useEffect(() => onProgress(progress), [progress, onProgress])

  if (!p) return null
  const now = Math.min(p.steps.length - 1, Math.floor(progress * p.steps.length))

  return (
    <section className="st st-remedy">
      <h2 className="st-title">{p.title}</h2>
      {p.when && <p className="st-sub">{p.when}</p>}
      <p className="st-now" key={complete ? 'done' : now}>{complete ? 'Complete. Sit a moment in silence.' : p.steps[now]}</p>
      <ol className="st-steps">
        {p.steps.map((s, i) => (
          <li key={i} className={complete || i < now ? 'is-past' : i === now ? 'is-now' : ''}>{s}</li>
        ))}
      </ol>
      <div className="st-timer">
        <span className="st-timer-time">{formatTime(left)}</span>
        <span className="st-bar"><i style={{ transform: `scaleX(${progress})` }} /></span>
      </div>
      <p className="st-source">{p.side ? `${SIDE[p.side]} · ` : ''}{p.source}</p>
    </section>
  )
}
