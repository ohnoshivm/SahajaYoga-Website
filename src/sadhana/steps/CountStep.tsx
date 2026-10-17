import { useState } from 'react'
import { BANDHAN, RAISE } from '../library'
import { haptic, isControl, useDelay, useRipples, useSpace, type StepProps } from './common'
import { Ripples } from './Ripples'

/** Everyone knows how; the screen only counts. */
type Task = { title: string; times: number }

/** The opening (raise the Kundalini ×3, bandhan ×7) and the close (bandhan ×7, thanks). */
export function CountStep({ kind, active, paused, onDone, onProgress }: StepProps & { kind: 'prepare' | 'close' }) {
  const tasks: Task[] = kind === 'prepare' ? [RAISE, BANDHAN] : [BANDHAN]
  const [t, setT] = useState(0)
  const [count, setCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [ripples, spawn] = useRipples()
  const delay = useDelay()
  const task = tasks[Math.min(t, tasks.length - 1)]
  const live = active && !paused && !finished

  const tap = () => {
    if (!live || count >= task.times) return
    const next = count + 1
    setCount(next)
    onProgress((t + next / task.times) / tasks.length)
    haptic(next < task.times ? 8 : [16, 60, 16])
    if (next < task.times) return
    if (t + 1 < tasks.length) {
      delay(() => {
        setT(t + 1)
        setCount(0)
      }, 900)
    } else {
      setFinished(true)
      onDone()
    }
  }
  useSpace(live, tap)

  const after = tasks[t + 1]
  return (
    <section
      className="st st-count"
      onPointerDown={(e) => live && !isControl(e) && spawn(e)}
      onPointerUp={(e) => !isControl(e) && tap()}
    >
      <h2 className="st-title" key={t}>{finished && kind === 'close' ? 'Thank You, Mother' : task.title}</h2>
      <div className="st-counter" aria-live="polite" aria-label={`${count} of ${task.times}`}>
        <span className="st-roll"><span className="st-counter-n" key={`${t}-${count}`}>{count}</span></span>
        <span className="st-counter-of">/{task.times}</span>
      </div>
      <div className="st-dots" aria-hidden="true">
        {Array.from({ length: task.times }, (_, i) => <i key={i} className={i < count ? 'is-on' : ''} />)}
      </div>
      <p className="st-foot">{finished ? '' : after ? `Then ${after.title.toLowerCase()}` : 'Tap or press Space for each one'}</p>
      <Ripples ripples={ripples} />
    </section>
  )
}
