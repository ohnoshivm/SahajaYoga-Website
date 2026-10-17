import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import type { Chakra } from '../chakra/chakras'
import { ChakraForm } from '../chakra/ChakraForm'
import { ChakraSwitch } from './ChakraSwitch'
import { GuidePanel } from './GuidePanel'
import { formatTime, lastSplit, LAPS_PER_ROUND, progress } from '../engine/session'
import { saveToHistory, useClock, useSession } from './useSession'
import { RagaControl, useRecordingChoice } from './RagaControl'
import { lapBell, roundBell } from '../audio/bell'

const HOLD_MS = 550
const FORM_SIZE = 4.5 // world units across the petals

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const m = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(m.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return reduced
}

function vibrate(p: number | number[]) {
  try {
    navigator.vibrate?.(p)
  } catch {
    /* unsupported */
  }
}

/** Keeps the form at ~60% of the height on wide screens and ~82% of the width on phones. */
function CameraRig() {
  const { camera, size } = useThree()
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / size.height
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2))
    const byHeight = FORM_SIZE / 0.6 / (2 * tan)
    const byWidth = FORM_SIZE / (0.9 * aspect) / (2 * tan)
    cam.position.set(0, 0, Math.max(byHeight, byWidth))
    cam.updateProjectionMatrix()
  }, [camera, size])
  return null
}

type Ripple = { id: number; x: number; y: number }

export function MeditationScreen({ chakra }: { chakra: Chakra }) {
  const [state, dispatch] = useSession(chakra.slug)
  const time = useClock(state)
  const reduced = useReducedMotion()

  const pulse = useRef(0)
  const bloom = useRef(0)
  const pointer = useRef<[number, number]>([0, 0])
  const [wave, setWave] = useState(0)
  const [caption, setCaption] = useState<string | null>(null)
  const [ripples, setRipples] = useState<Ripple[]>([])

  const prog = useMemo(() => progress(state), [state])
  const { lap, round, taps, splits } = prog
  const done = splits.length
  const running = state.runStart !== null
  const started = state.events.length > 0
  const paused = started && !running && !state.ended

  // ── Raga ──────────────────────────────────────────────
  const [recording, chooseRecording] = useRecordingChoice(chakra.slug, chakra.raga)
  const [guideOpen, setGuideOpen] = useState(false)

  // ── Counting ──────────────────────────────────────────
  const say = useCallback((msg: string, ms = 1800) => {
    setCaption(msg)
    window.setTimeout(() => setCaption((c) => (c === msg ? null : c)), ms)
  }, [])

  const [bellOn, setBellOn] = useState(() => {
    try {
      return localStorage.getItem('sy.bell') !== 'off'
    } catch {
      return true
    }
  })
  const toggleBell = useCallback(() => {
    setBellOn((on) => {
      try {
        localStorage.setItem('sy.bell', on ? 'off' : 'on')
      } catch {
        /* storage unavailable */
      }
      return !on
    })
  }, [])

  const celebrate = useCallback((n: number) => {
    if (bellOn) roundBell()
    bloom.current = 1
    setWave((w) => w + 1)
    say(`Round ${n} complete`)
    vibrate([30, 70, 30])
  }, [say, bellOn])

  const tap = useCallback(() => {
    if (state.ended) return
    pulse.current = 1
    if (lap === LAPS_PER_ROUND - 1) celebrate(round)
    else {
      if (bellOn) lapBell()
      vibrate(8)
    }
    dispatch({ type: 'tap', now: performance.now() })
  }, [state.ended, lap, round, dispatch, celebrate, bellOn])

  // Close the current round now. Nothing to close at lap 0.
  const nextRound = useCallback(() => {
    if (state.ended || lap === 0) return
    if (lap < LAPS_PER_ROUND) celebrate(round)
    else {
      if (bellOn) lapBell()
      vibrate(16)
    }
    dispatch({ type: 'next', now: performance.now() })
  }, [state.ended, lap, round, dispatch, celebrate, bellOn])

  const undo = useCallback(() => {
    const last = state.events[state.events.length - 1]
    if (!last || state.ended) return
    dispatch({ type: 'undo', now: performance.now() })
    vibrate(16)
    say(last.kind === 'round' ? 'Next round undone' : 'Last lap undone', 1300)
  }, [state.events, state.ended, dispatch, say])

  const togglePause = useCallback(() => {
    if (!started || state.ended) return
    dispatch({ type: running ? 'pause' : 'resume', now: performance.now() })
  }, [started, running, state.ended, dispatch])

  const end = useCallback(() => {
    if (!started) return
    dispatch({ type: 'end', now: performance.now() })
  }, [started, dispatch])

  useEffect(() => {
    if (state.ended) saveToHistory(state)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ended])

  // Tap anywhere; hold to undo.
  const holdTimer = useRef<number | null>(null)
  const held = useRef(false)
  const clearHold = () => {
    if (holdTimer.current !== null) clearTimeout(holdTimer.current)
    holdTimer.current = null
  }
  const onDown = (e: React.PointerEvent) => {
    if (e.button !== 0 || state.ended) return
    held.current = false
    const id = performance.now()
    if (!reduced) {
      setRipples((r) => [...r.slice(-5), { id, x: e.clientX, y: e.clientY }])
      window.setTimeout(() => setRipples((r) => r.filter((x) => x.id !== id)), 1100)
    }
    holdTimer.current = window.setTimeout(() => {
      held.current = true
      undo()
    }, HOLD_MS)
  }
  const onUp = () => {
    const wasPending = holdTimer.current !== null
    clearHold()
    if (wasPending && !held.current) tap()
  }
  const onMove = (e: React.PointerEvent) => {
    pointer.current = [(e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1]
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      const onButton = e.target instanceof HTMLElement && !!e.target.closest('button, a')
      if (e.key === ' ' && !onButton) {
        e.preventDefault()
        tap()
      } else if (e.key === 'Enter' && !onButton) {
        e.preventDefault()
        nextRound()
      } else if (e.key === 'Backspace' || e.key.toLowerCase() === 'z') undo()
      else if (e.key.toLowerCase() === 'p') togglePause()
      else if (e.key.toLowerCase() === 'b') toggleBell()
      else if (e.key.toLowerCase() === 'g') setGuideOpen((o) => !o)
      else if (e.key === 'Escape') setGuideOpen(false)
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  }, [tap, nextRound, undo, togglePause, toggleBell])

  const shield = { onPointerDown: (e: React.SyntheticEvent) => e.stopPropagation(), onPointerUp: (e: React.SyntheticEvent) => e.stopPropagation() }

  const vars = {
    '--field': chakra.theme.field,
    '--ink': chakra.theme.ink,
    '--ink-soft': chakra.theme.inkSoft,
    '--glow': chakra.theme.glow,
  } as React.CSSProperties

  const roundTime = started ? Math.max(0, time - lastSplit(prog)) : 0

  return (
    <main
      className={`med ${reduced ? 'is-reduced' : ''} ${paused ? 'is-paused' : ''} ${started ? 'is-started' : ''}`}
      style={vars}
      onPointerDown={onDown}
      onPointerUp={onUp}
      onPointerCancel={clearHold}
      onPointerLeave={clearHold}
      onPointerMove={onMove}
    >
      {wave > 0 && <div key={wave} className="med-wave" aria-hidden="true" />}
      <h1 className="med-name">
        <span className="med-name-word">{chakra.name}</span>
        <span className="med-name-script">{chakra.quality}</span>
      </h1>

      <div className="med-shadow" aria-hidden="true" />
      <div className="med-stage" aria-hidden="true">
        <Canvas
          dpr={[1, 2]}
          camera={{ position: [0, 0, 20], fov: 26 }}
          gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.05 }}
        >
          <CameraRig />
          <ambientLight intensity={0.35} />
          <directionalLight position={[-3, 4, 6]} intensity={2.1} color={chakra.theme.light.key} />
          <directionalLight position={[4, -1, 3]} intensity={0.6} color={chakra.theme.light.fill} />
          <Suspense fallback={null}>
            <Environment resolution={256}>
              <Lightformer form="rect" intensity={2.6} position={[-2, 5, 5]} scale={[10, 2.5, 1]} />
              <Lightformer form="rect" intensity={1.4} position={[3, 2, 6]} scale={[2, 6, 1]} rotation={[0, -0.4, 0]} />
              <Lightformer form="circle" intensity={1.6} position={[-6, 0, 4]} scale={4} color={chakra.theme.light.key} />
              <Lightformer form="rect" intensity={1.1} position={[6, -3, 4]} scale={[3, 8, 1]} color={chakra.theme.light.rim} />
              <Lightformer form="ring" intensity={0.8} position={[0, 0, -6]} scale={10} color={chakra.theme.light.fill} />
            </Environment>
          </Suspense>
          <ChakraForm slug={chakra.slug} pulse={pulse} bloom={bloom} pointer={pointer} still={reduced} />
        </Canvas>
      </div>

      <div className="med-ripples" aria-hidden="true">
        {ripples.map((r) => (
          <span key={r.id} style={{ left: r.x, top: r.y }} />
        ))}
      </div>

      <header className="med-top" {...shield}>
        <div className="med-left">
          <a className="med-mark" href="/" aria-label="SAHAJA YOGA, home">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c2.2 2.5 3.3 5 3.3 7.6 0 2.7-1.4 4.9-3.3 6.4-1.9-1.5-3.3-3.7-3.3-6.4C8.7 8 9.8 5.5 12 3Zm-8.5 6.2c2.9.3 5.1 1.6 6.6 3.8.7 1 1.1 2.1 1.3 3.2-3.9-.2-7-3-7.9-7Zm17 0c-.9 4-4 6.8-7.9 7 .2-1.1.6-2.2 1.3-3.2 1.5-2.2 3.7-3.5 6.6-3.8ZM5 18.5h14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span>SAHAJA YOGA</span>
        </a>
          <ChakraSwitch current={chakra} />
          <button className={`guide-btn ${guideOpen ? 'is-on' : ''}`} onClick={() => setGuideOpen((o) => !o)} aria-expanded={guideOpen} aria-label={`${chakra.name} guide`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 6.5C10 5 7.5 4.5 4.5 4.8v12.6c3-.3 5.5.2 7.5 1.7 2-1.5 4.5-2 7.5-1.7V4.8c-3-.3-5.5.2-7.5 1.7Zm0 0v12.6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
            <span>Guide</span>
          </button>
        </div>

        <div className="med-actions">
          <button
            className={`bell ${bellOn ? 'is-on' : ''}`}
            onClick={toggleBell}
            aria-pressed={bellOn}
            aria-label={bellOn ? 'Lap bell on' : 'Lap bell off'}
            title={bellOn ? 'Lap bell on (B)' : 'Lap bell off (B)'}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 1.5h-15L6 16.5Z M10 19.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              {!bellOn && <path d="M4 4l16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
            </svg>
          </button>
          <RagaControl raga={chakra.raga} recording={recording} onChoose={chooseRecording} />
          {started && !state.ended && (
            <>
              <button className="ghost" onClick={togglePause}>{running ? 'Pause' : 'Resume'}</button>
              <button className="ghost" onClick={end}>End</button>
            </>
          )}
        </div>
      </header>

      {guideOpen && <GuidePanel chakra={chakra} onClose={() => setGuideOpen(false)} />}

      <p className="med-caption" role="status" aria-live="polite">{caption ?? (paused ? 'Paused · tap to continue' : '')}</p>

      <div className="med-idle" aria-hidden={started}>
        <p>Tap anywhere to count</p>
        <ul>
          <li><kbd>Space</kbd> count</li>
          <li><kbd>Hold</kbd> undo</li>
          <li><kbd>P</kbd> pause</li>
          <li><kbd>B</kbd> bell</li>
          <li><kbd>G</kbd> guide</li>
          <li><kbd>Enter</kbd> next round</li>
        </ul>
      </div>

      <footer className="med-band" aria-label="Count and time">
        <div className="stat stat-lap" aria-live="polite" aria-atomic="true">
          <span className="label">Lap</span>
          <span className="lap">
            <span className="lap-mask"><span className="lap-num" key={taps}>{String(lap).padStart(2, '0')}</span></span>
            <span className="lap-of">/{LAPS_PER_ROUND}</span>
          </span>
          <span className="sr-only">Lap {lap} of {LAPS_PER_ROUND}, round {round}</span>
        </div>
        <button type="button" className="stat stat-round" aria-label="Next round" onClick={nextRound} {...shield}>
          <span className="label">Round</span>
          <span className="mid"><span className="lap-mask"><span className="mid-num" key={round}>{String(round).padStart(2, '0')}</span></span></span>
          <span className="note">{done === 0 ? 'Ten laps make a round' : `${done} complete`}</span>
        </button>
        <div className="stat stat-time">
          <span className="label">Time</span>
          <span className="mid">{formatTime(time)}</span>
          <span className="note">This round {formatTime(roundTime)}</span>
        </div>
      </footer>

      {state.ended && (
        <section className="summary" role="dialog" aria-modal="true" aria-label="Session complete" {...shield}>
          <header className="summary-top">
            <span className="med-mark-text">SAHAJA YOGA</span>
            <span>{chakra.name} · session complete</span>
          </header>
          <div className="summary-hero">
            <span className="summary-num">{String(done).padStart(2, '0')}</span>
            <span className="summary-word">{done === 1 ? 'round' : 'rounds'}</span>
          </div>
          <dl className="summary-stats">
            <div><dt>Time</dt><dd>{formatTime(state.banked)}</dd></div>
            <div><dt>Laps</dt><dd>{taps}</dd></div>
            <div><dt>Avg round</dt><dd>{done ? formatTime(splits[done - 1] / done) : '—'}</dd></div>
          </dl>
          {done > 0 && (
            <ol className="summary-splits" aria-label="Round times">
              {splits.map((ms, i) => (
                <li key={i}><span>R{i + 1}</span>{formatTime(ms - (i ? splits[i - 1] : 0))}</li>
              ))}
            </ol>
          )}
          <div className="summary-actions">
            <button className="solid" onClick={() => dispatch({ type: 'reset' })} autoFocus>Begin again</button>
            <p>Saved to your practice on this device.</p>
          </div>
          <p className="summary-credit">
            {chakra.raga.name} · {recording.credit.performers} · {recording.credit.source} ·{' '}
            <a href={recording.credit.url} target="_blank" rel="noopener noreferrer">{recording.credit.license}</a>
          </p>
        </section>
      )}
    </main>
  )
}
