import { useCallback, useEffect, useLayoutEffect, useRef, useState, type Dispatch } from 'react'
import type { ChakraTheme } from '../chakra/chakras'
import { formatTime } from '../engine/session'
import { useReducedMotion } from '../screen/MeditationScreen'
import { completed, sitElapsed, type SitAction, type SitState } from './engine'
import { Icon } from './Icon'
import { FIELDS, stepInfo } from './library'
import { AffirmStep } from './steps/AffirmStep'
import { ChantStep } from './steps/ChantStep'
import { GestureStep } from './steps/GestureStep'
import { LapsStep } from './steps/LapsStep'
import { RemedyStep } from './steps/RemedyStep'
import { SilenceStep } from './steps/SilenceStep'
import { TalkStep } from './steps/TalkStep'
import type { Feeling } from './types'
import type { TalkController } from './youtube'

/** The new step's colour rising out of its place on the rail. */
const WIPE_MS = 900
/** The title card holds this long before the step itself begins. */
const CARD_MS = 1800
/** After a step completes, the next one is named for this long before the sitting moves on. */
const HANDOFF_MS = 2600

function useSitClock(state: SitState) {
  const [now, setNow] = useState(() => performance.now())
  useEffect(() => {
    if (state.runStart === null) return
    const id = setInterval(() => setNow(performance.now()), 500)
    return () => clearInterval(id)
  }, [state.runStart])
  return sitElapsed(state, state.runStart === null ? 0 : now)
}

const themeVars = (t: ChakraTheme) =>
  ({ '--field': t.field, '--ink': t.ink, '--ink-soft': t.inkSoft, '--glow': t.glow }) as React.CSSProperties

type Handoff = 'off' | 'counting' | 'held'
type Props = { state: SitState; dispatch: Dispatch<SitAction>; feeling: Feeling; talk: TalkController | null }

export function Run({ state, dispatch, feeling, talk }: Props) {
  const { index, steps } = state
  const step = steps[index]
  const info = stepInfo(step)
  const nextInfo = steps[index + 1] ? stepInfo(steps[index + 1]) : null
  const paused = state.runStart === null
  const clock = useSitClock(state)
  const reduced = useReducedMotion()
  const done = completed(state)

  // ── The field change: the old colour stays underneath until the new one has risen ──
  const [base, setBase] = useState<ChakraTheme>(FIELDS.white)
  // Which step has finished its title card. Tied to the index, so a new step is never active on its first frame.
  const [activeIndex, setActiveIndex] = useState(-1)
  const active = activeIndex === index
  const wipe = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const el = wipe.current
    const x = ((index + 0.5) / steps.length) * 100
    const anim = el?.animate(
      reduced
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [{ clipPath: `circle(0% at ${x}% 0%)` }, { clipPath: `circle(150% at ${x}% 0%)` }],
      { duration: reduced ? 400 : WIPE_MS, easing: 'cubic-bezier(0.65, 0, 0.35, 1)', fill: 'both' },
    )
    const settle = window.setTimeout(() => setBase(info.theme), reduced ? 400 : WIPE_MS)
    const begin = window.setTimeout(() => setActiveIndex(index), reduced ? 700 : CARD_MS)
    return () => {
      anim?.cancel()
      clearTimeout(settle)
      clearTimeout(begin)
    }
    // Runs once per step: the theme follows the index.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // ── Live rail: the current segment fills as the step goes, without re-rendering ──
  const fills = useRef<(HTMLElement | null)[]>([])
  const progress = useRef(0)
  const onProgress = useCallback(
    (f: number) => {
      progress.current = f
      fills.current[index]?.style.setProperty('--p', String(Math.min(1, Math.max(0, f))))
    },
    [index],
  )
  useEffect(() => {
    progress.current = 0
  }, [index])

  // ── Hand-off: a completed step names what comes next, then moves on ──
  const [handoff, setHandoff] = useState<Handoff>('off')
  const now = () => performance.now()
  const advance = useCallback(() => {
    setHandoff('off')
    dispatch({ type: 'done', now: performance.now() })
  }, [dispatch])
  const onDone = useCallback(() => setHandoff('counting'), [])

  useEffect(() => setHandoff('off'), [index])
  useEffect(() => {
    if (handoff !== 'counting' || paused) return
    const id = window.setTimeout(advance, HANDOFF_MS)
    return () => clearTimeout(id)
  }, [handoff, paused, advance])

  const forward = () => (handoff === 'off' ? dispatch({ type: 'skip', now: now() }) : advance())
  const back = () => dispatch({ type: 'back', now: now() })
  const pause = () => !paused && dispatch({ type: 'pause', now: now() })
  const resume = () => paused && dispatch({ type: 'resume', now: now() })
  const end = () => dispatch({ type: 'end', now: now() })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || (e.target instanceof HTMLElement && e.target.closest('input, textarea, select'))) return
      const onButton = e.target instanceof HTMLElement && !!e.target.closest('button, a')
      if (e.key === 'Escape') return paused ? resume() : pause()
      if (e.key === 'ArrowRight') return forward()
      if (e.key === 'ArrowLeft') return back()
      if (step.kind === 'laps') return // the mantra screen keeps Space, Enter and P
      if (e.key === 'Enter' && !onButton) forward()
      else if (e.key.toLowerCase() === 'p') (paused ? resume : pause)()
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  // ── Time left: what remains of this step plus the steps after it ──
  const after = steps.slice(index + 1).reduce((n, s) => n + stepInfo(s).minutes, 0)
  const left = Math.round(after + info.minutes * (1 - progress.current))
  const leftText = left >= 1 ? `About ${left} min left` : 'Almost done'

  const label = (
    <div className="sit-label">
      <svg className="sit-mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c2.2 2.5 3.3 5 3.3 7.6 0 2.7-1.4 4.9-3.3 6.4-1.9-1.5-3.3-3.7-3.3-6.4C8.7 8 9.8 5.5 12 3Zm-8.5 6.2c2.9.3 5.1 1.6 6.6 3.8.7 1 1.1 2.1 1.3 3.2-3.9-.2-7-3-7.9-7Zm17 0c-.9 4-4 6.8-7.9 7 .2-1.1.6-2.2 1.3-3.2 1.5-2.2 3.7-3.5 6.6-3.8ZM5 18.5h14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      <span className="sit-count">{index + 1}<span>/{steps.length}</span></span>
      <span className="sit-title">{info.title}</span>
    </div>
  )

  const common = { active, paused, feeling, onDone, onProgress }
  let body: React.ReactNode = null
  switch (step.kind) {
    case 'prepare':
    case 'close':
      body = <GestureStep kind={step.kind} {...common} />
      break
    case 'chant':
      body = <ChantStep chant={step.chant} repeats={step.repeats} mode={step.mode} {...common} />
      break
    case 'silence':
      body = <SilenceStep chakra={step.chakra} minutes={step.minutes} {...common} />
      break
    case 'remedy':
      body = <RemedyStep remedy={step.remedy} minutes={step.minutes} {...common} />
      break
    case 'affirm':
      body = <AffirmStep chakra={step.chakra} {...common} />
      break
    case 'talk':
      body = <TalkStep talk={talk} {...common} />
      break
    case 'laps':
      body = (
        <LapsStep
          chakra={step.chakra}
          rounds={step.rounds}
          {...common}
          header={
            <>
              {label}
              <button className="sit-icon" onClick={forward} aria-label="Next step" title="Next step (→)"><Icon name="next" /></button>
            </>
          }
        />
      )
  }

  return (
    <main className={`sit is-${step.kind} ${paused ? 'is-paused' : ''}`} style={{ ...themeVars(info.theme), background: base.field }}>
      <div className="sit-wipe" key={`wipe-${index}`} ref={wipe} style={{ background: info.theme.field }} aria-hidden="true" />

      <nav className="sit-rail" aria-label="Steps">
        {steps.map((s, i) => {
          const isNow = i === index
          const cls = isNow ? 'is-now' : done.has(i) ? 'is-done' : i < index ? 'is-skipped' : ''
          return (
            <button
              key={i}
              className={cls}
              onClick={() => dispatch({ type: 'jump', to: i, now: now() })}
              aria-label={`Step ${i + 1}: ${stepInfo(s).title}`}
              aria-current={isNow ? 'step' : undefined}
              title={stepInfo(s).title}
            >
              <i>
                <b
                  ref={(el) => {
                    fills.current[i] = el
                  }}
                  style={isNow ? undefined : ({ '--p': i < index || done.has(i) ? 1 : 0 } as React.CSSProperties)}
                />
              </i>
            </button>
          )
        })}
      </nav>

      {step.kind !== 'laps' && (
        <header className="sit-top">
          {label}
          <div className="sit-actions">
            <span className="sit-left">{leftText}</span>
            <button className="sit-icon" onClick={paused ? resume : pause} aria-label={paused ? 'Resume' : 'Pause'} title={paused ? 'Resume (P)' : 'Pause (P)'}>
              <Icon name={paused ? 'play' : 'pause'} />
            </button>
            <button className="sit-icon" onClick={forward} aria-label="Next step" title="Next step (→)"><Icon name="next" /></button>
          </div>
        </header>
      )}

      <div className={`sit-body ${active ? 'is-in' : ''}`} key={`body-${index}`}>{body}</div>

      <div className="sit-card" key={`card-${index}`} aria-hidden={active}>
        <h2 className="sit-card-title">{info.title}</h2>
        <p className="sit-card-d">{info.detail}</p>
      </div>

      {handoff !== 'off' && (
        <div className={`sit-handoff ${step.kind === 'laps' ? 'is-top' : ''} ${handoff === 'held' || paused ? 'is-held' : ''}`} role="status">
          <i className="sit-handoff-line" key={paused ? 'paused' : handoff} style={{ animationDuration: `${HANDOFF_MS}ms` }} aria-hidden="true" />
          <p className="sit-handoff-text">
            {nextInfo ? (<>Next <b>{nextInfo.title}</b></>) : <b>The sitting is complete</b>}
          </p>
          {handoff === 'counting' && <button className="sit-btn" onClick={() => setHandoff('held')}>Stay</button>}
          <button className="sit-btn is-solid" onClick={advance}>{nextInfo ? 'Continue' : 'Finish'}</button>
        </div>
      )}

      {step.kind !== 'laps' && (
        <p className="sit-keys" aria-hidden="true">
          <span><kbd>→</kbd> next</span>
          <span><kbd>←</kbd> back</span>
          <span><kbd>P</kbd> pause</span>
        </p>
      )}

      {paused && (
        <div className="sit-paused" role="dialog" aria-modal="true" aria-label="Sitting paused">
          <p className="sit-paused-word">Paused</p>
          <p className="sit-paused-d">{info.title} · {formatTime(clock)} so far</p>
          <div className="sit-paused-actions">
            <button className="sit-btn is-solid is-large" onClick={resume} autoFocus>Resume</button>
            <button className="sit-btn is-large" onClick={end}>End sitting</button>
          </div>
        </div>
      )}
    </main>
  )
}
