import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../../screen/MeditationScreen'
import { isControl, useCountdown, useSpace, type StepProps } from './common'

/**
 * The opening and the close, without counting: a point of light traces the gesture at an
 * unhurried pace and you move with it. Raise the Kundalini three times, then a bandhan seven
 * times. Tap or Space when you have finished, or let the light finish for you.
 */
type Gesture = { id: 'raise' | 'bandhan'; title: string; note: string; cycles: number; cycleMs: number }

const RAISE: Gesture = { id: 'raise', title: 'Raise your Kundalini', note: 'Three times, a knot above your head each time', cycles: 3, cycleMs: 5600 }
const BANDHAN: Gesture = { id: 'bandhan', title: 'Put on a bandhan', note: 'Seven times, over your head and back', cycles: 7, cycleMs: 3600 }

/** A seated figure, drawn once, under both gestures. */
const FIGURE = 'M76 214 C78 166 96 142 120 142 C144 142 162 166 164 214'
/** Up the front of the body to above the head. */
const RISE = 'M120 206 V44'
/** The knot tied above the head. */
const KNOT = 'M112 46 C110 30 132 30 130 44 C129 54 115 54 114 44'
/** From the left hip, over the head, down to the right hip. */
const ARC = 'M74 206 C52 18 188 18 166 206'

const EASE = '0.45 0 0.2 1'

/** One clock for the whole drawing: SVG's own timeline, paused and resumed with the sitting. */
function Figure({ g, running }: { g: Gesture; running: boolean }) {
  const svg = useRef<SVGSVGElement>(null)
  const reduced = useReducedMotion()

  useLayoutEffect(() => {
    svg.current?.setCurrentTime(0)
  }, [])
  useLayoutEffect(() => {
    const el = svg.current
    if (!el) return
    if (running && !reduced) el.unpauseAnimations()
    else el.pauseAnimations()
  }, [running, reduced])

  const dur = `${g.cycleMs}ms`
  const reps = String(g.cycles)
  return (
    <svg ref={svg} className={`gs-figure is-${g.id} ${reduced ? 'is-still' : ''}`} viewBox="0 0 240 230" aria-hidden="true">
      <g className="gs-body" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
        <circle cx="120" cy="112" r="17" />
        <path d={FIGURE} />
      </g>
      {g.id === 'raise' ? (
        <>
          <path className="gs-guide" d={RISE} />
          <path className="gs-trail" d={RISE} pathLength={1} strokeDasharray="1" strokeDashoffset={reduced ? 0 : 1}>
            {!reduced && (
              <>
                <animate attributeName="stroke-dashoffset" dur={dur} repeatCount={reps} values="1;0;0" keyTimes="0;0.7;1" calcMode="spline" keySplines={`${EASE};0 0 1 1`} />
                <animate attributeName="opacity" dur={dur} repeatCount={reps} values="1;1;0;0" keyTimes="0;0.72;0.92;1" />
              </>
            )}
          </path>
          <path className="gs-trail" d={KNOT} pathLength={1} strokeDasharray="1" strokeDashoffset={reduced ? 0 : 1}>
            {!reduced && (
              <>
                <animate attributeName="stroke-dashoffset" dur={dur} repeatCount={reps} values="1;1;0;0" keyTimes="0;0.68;0.86;1" />
                <animate attributeName="opacity" dur={dur} repeatCount={reps} values="1;1;0;0" keyTimes="0;0.86;0.95;1" />
              </>
            )}
          </path>
          <circle className="gs-dot" r="6" cx="120" cy={reduced ? 44 : 206}>
            {!reduced && (
              <>
                <animate attributeName="cy" dur={dur} repeatCount={reps} values="206;44;44" keyTimes="0;0.7;1" calcMode="spline" keySplines={`${EASE};0 0 1 1`} />
                <animate attributeName="opacity" dur={dur} repeatCount={reps} values="0;1;1;0;0" keyTimes="0;0.06;0.7;0.9;1" />
              </>
            )}
          </circle>
        </>
      ) : (
        <>
          <path className="gs-guide" d={ARC} />
          <path className="gs-trail" d={ARC} pathLength={1} strokeDasharray="1" strokeDashoffset={reduced ? 0 : 1}>
            {!reduced && (
              <animate attributeName="stroke-dashoffset" dur={dur} repeatCount={reps} values="1;0;1" keyTimes="0;0.5;1" calcMode="spline" keySplines={`${EASE};${EASE}`} />
            )}
          </path>
          <circle className="gs-dot" r="6" cx={reduced ? 120 : 0} cy={reduced ? 48 : 0}>
            {!reduced && (
              <animateMotion dur={dur} repeatCount={reps} path={ARC} keyPoints="0;1;0" keyTimes="0;0.5;1" calcMode="spline" keySplines={`${EASE};${EASE}`} />
            )}
          </circle>
        </>
      )}
    </svg>
  )
}

function Phase({ g, running, onEnd, onFraction }: { g: Gesture; running: boolean; onEnd: () => void; onFraction: (f: number) => void }) {
  const total = g.cycles * g.cycleMs
  const left = useCountdown(total, running, onEnd)
  const f = 1 - left / total
  useEffect(() => onFraction(f), [f, onFraction])
  return (
    <>
      <h2 className="st-title">{g.title}</h2>
      <Figure g={g} running={running} />
      <p className="st-sub">{g.note}</p>
    </>
  )
}

export function GestureStep({ kind, active, paused, onDone, onProgress }: StepProps & { kind: 'prepare' | 'close' }) {
  const gestures = kind === 'prepare' ? [RAISE, BANDHAN] : [BANDHAN]
  const [t, setT] = useState(0)
  const [finished, setFinished] = useState(false)
  const running = active && !paused && !finished

  const next = () => {
    if (finished) return
    if (t + 1 < gestures.length) {
      onProgress((t + 1) / gestures.length)
      setT(t + 1)
      return
    }
    setFinished(true)
    onProgress(1)
    onDone()
  }
  useSpace(active && !finished, next)

  return (
    <section className="st st-gesture" onPointerUp={(e) => active && !isControl(e) && next()}>
      {finished && kind === 'close' ? (
        <h2 className="st-title st-thanks">Thank You, Mother</h2>
      ) : (
        <Phase
          key={t}
          g={gestures[t]}
          running={running}
          onEnd={next}
          onFraction={(f) => onProgress((t + f) / gestures.length)}
        />
      )}
      <p className="st-foot">{finished ? '' : 'Follow the light. Tap or press Space when you’ve finished.'}</p>
    </section>
  )
}
