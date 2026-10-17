import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from '../../screen/MeditationScreen'
import { CHANTS } from '../chants'
import type { ChantMode, Gloss } from '../types'
import { isControl, useSpace, type StepProps } from './common'

/** Light a line slightly before it is sung, so the eye arrives with the voice. */
const LEAD = 0.25

type Line = {
  at?: number
  end: number
  deva: string
  roman: string
  meaning: string
  tokens: Gloss[]
  /** Where each word starts, as a share of the line's letters, for the sung highlight. */
  starts: number[]
  verse: number
  verseTitle?: string
  firstOfVerse: boolean
  /** The first line past the end of the recording. */
  firstUntimed: boolean
}

/**
 * The chant reader: one column of every line, Devanagari over transliteration, the meaning
 * opening under the line being sung. Follow plays the recording and keeps the sung line centred,
 * its words lighting in turn; Recite is text only, tap or Space for the next line.
 */
export function ChantStep({ chant: id, repeats, mode: startMode, active, paused, onDone, onProgress }: StepProps & { chant: string; repeats: number; mode: ChantMode }) {
  const chant = CHANTS[id]
  const reduced = useReducedMotion()

  const lines = useMemo<Line[]>(() => {
    const flat = chant.verses.flatMap((v, vi) => v.lines.map((l, li) => ({ ...l, verse: vi, verseTitle: v.title, firstOfVerse: li === 0 })))
    let seenUntimed = false
    return flat.map((l, i) => {
      const next = flat.slice(i + 1).find((x) => x.at !== undefined)
      const tokens = l.words ?? l.roman.split(' ').map((w) => ({ w, m: '' }))
      const total = tokens.reduce((n, t) => n + t.w.length, 0) || 1
      let run = 0
      const starts = tokens.map((t) => {
        const s = run / total
        run += t.w.length
        return s
      })
      const firstUntimed = l.at === undefined && !seenUntimed
      if (firstUntimed) seenUntimed = true
      return { ...l, tokens, starts, firstUntimed, end: next?.at ?? Math.min(chant.duration, (l.at ?? 0) + 6) }
    })
  }, [chant])

  const [mode, setMode] = useState<ChantMode>(startMode)
  const [line, setLine] = useState(-1)
  const [lit, setLit] = useState(0)
  const [gloss, setGloss] = useState<{ line: number; word: number } | null>(null)
  const [blocked, setBlocked] = useState(false)
  const [finished, setFinished] = useState(false)
  const audio = useRef<HTMLAudioElement | null>(null)
  const rep = useRef(0)
  const els = useRef<(HTMLElement | null)[]>([])
  const titleEl = useRef<HTMLDivElement>(null)

  const finish = () => {
    setFinished(true)
    onProgress(1)
    onDone()
  }

  useEffect(() => {
    const a = new Audio(chant.audio)
    a.preload = 'auto'
    audio.current = a
    return () => {
      a.pause()
      a.removeAttribute('src')
      a.load()
    }
  }, [chant.audio])

  const playing = active && !paused && mode === 'follow' && !finished

  useEffect(() => {
    const a = audio.current
    if (!a) return
    if (playing) a.play().then(() => setBlocked(false), () => setBlocked(true))
    else a.pause()
  }, [playing])

  // Follow the recording: the sung line, and how far through it the voice is.
  useEffect(() => {
    if (!playing) return
    let raf = 0
    const tick = () => {
      const a = audio.current
      const t = a?.currentTime ?? 0
      let idx = -1
      for (let i = 0; i < lines.length; i++) {
        const at = lines[i].at
        if (at !== undefined && at - LEAD <= t) idx = i
      }
      setLine(idx)
      if (idx >= 0) {
        const l = lines[idx]
        const f = Math.min(1, Math.max(0, (t - (l.at ?? 0) + LEAD) / Math.max(0.5, l.end - (l.at ?? 0))))
        setLit(l.starts.filter((s) => s <= f).length)
      } else setLit(0)
      const dur = a && Number.isFinite(a.duration) ? a.duration : chant.duration
      onProgress((rep.current + Math.min(1, t / dur)) / repeats)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, lines, repeats, chant.duration, onProgress])

  // Repeat the recording, then hand back.
  useEffect(() => {
    const a = audio.current
    if (!a) return
    const onEnded = () => {
      rep.current += 1
      if (rep.current < repeats) {
        a.currentTime = 0
        setLine(-1)
        void a.play()
      } else finish()
    }
    a.addEventListener('ended', onEnded)
    return () => a.removeEventListener('ended', onEnded)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [repeats, chant.audio])

  // Keep the current line centred. A second pass lands it after its meaning has opened.
  useEffect(() => {
    setGloss(null)
    const el = line >= 0 ? els.current[line] : titleEl.current
    if (!el) return
    const go = () => el.scrollIntoView({ block: 'center', behavior: reduced ? 'auto' : 'smooth' })
    go()
    const id = window.setTimeout(go, 480)
    return () => clearTimeout(id)
  }, [line, reduced])

  const next = () => {
    if (mode !== 'recite' || !active || paused || finished) return
    if (line < lines.length - 1) {
      setLine(line + 1)
      onProgress((rep.current + (line + 2) / lines.length) / repeats)
      return
    }
    rep.current += 1
    if (rep.current < repeats) setLine(0)
    else finish()
  }
  useSpace(active && mode === 'recite' && !finished, next)

  /** Follow: jump the recording to a line. Recite: tap the current line for the next, any other to go there. */
  const pick = (i: number) => {
    if (mode === 'recite') return i === line ? next() : setLine(i)
    const at = lines[i].at
    const a = audio.current
    if (at === undefined || !a) return
    a.currentTime = Math.max(0, at - LEAD + 0.02)
    setLine(i)
  }

  const switchMode = (m: ChantMode) => {
    if (m === mode) return
    const a = audio.current
    if (m === 'recite') setLine((l) => Math.max(0, l))
    else if (a) a.currentTime = Math.max(0, (lines[line]?.at ?? 0) - LEAD)
    setMode(m)
  }

  return (
    <section className={`st st-chant is-${mode}`} onPointerUp={(e) => mode === 'recite' && !isControl(e) && !(e.target as HTMLElement).closest('.cl') && next()}>
      <div className="cl-scroll">
        <div className={`cl cl-title ${line === -1 ? 'is-now' : ''}`} ref={titleEl}>
          <p className="cl-deva" lang="sa">{chant.script}</p>
          <p className="cl-name">{chant.title}</p>
          <p className="cl-about">{chant.about}</p>
        </div>

        {lines.map((l, i) => {
          const now = i === line
          const sung = mode === 'follow' && now ? lit : now ? l.tokens.length : 0
          const g = gloss && gloss.line === i ? l.tokens[gloss.word] : null
          return (
            <Fragment key={i}>
              {l.firstUntimed && mode === 'follow' && <p className="cl-note">The recording ends here. Switch to Recite to go on.</p>}
              {l.firstOfVerse && l.verseTitle && <h3 className="cl-verse">{l.verseTitle}</h3>}
              <div
                className={`cl ${now ? 'is-now' : i < line ? 'is-past' : ''} ${mode === 'follow' && l.at === undefined ? 'is-untimed' : ''}`}
                ref={(el) => {
                  els.current[i] = el
                }}
                onClick={() => pick(i)}
                aria-current={now ? 'true' : undefined}
              >
                <p className="cl-deva" lang="sa">{l.deva}</p>
                <p className="cl-roman">
                  {l.tokens.map((t, k) => {
                    const cls = `cl-w ${k < sung ? 'is-sung' : ''}`
                    const open = gloss?.line === i && gloss.word === k
                    return (
                      <Fragment key={k}>
                        {t.m ? (
                          <button
                            className={`${cls} has-gloss ${open ? 'is-open' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              setGloss(open ? null : { line: i, word: k })
                            }}
                            aria-expanded={open}
                          >
                            {t.w}
                          </button>
                        ) : (
                          <span className={cls}>{t.w}</span>
                        )}{' '}
                      </Fragment>
                    )
                  })}
                </p>
                <div className="cl-more">
                  <div>
                    <p className="cl-meaning" aria-live={now ? 'polite' : undefined}>
                      {g ? (<><b>{g.w}</b> {g.m}</>) : l.meaning}
                    </p>
                  </div>
                </div>
              </div>
            </Fragment>
          )
        })}
      </div>

      <footer className="chant-foot">
        <div className="sx-seg is-small" role="radiogroup" aria-label="How to chant">
          <button role="radio" aria-checked={mode === 'follow'} onClick={() => switchMode('follow')}>With the recording</button>
          <button role="radio" aria-checked={mode === 'recite'} onClick={() => switchMode('recite')}>Recite</button>
        </div>
        {blocked && mode === 'follow' && (
          <button className="sit-btn is-solid" onClick={() => audio.current?.play().then(() => setBlocked(false), () => {})}>Play the recording</button>
        )}
        <p className="st-source">
          {mode === 'recite' ? 'Tap or press Space for the next line · ' : 'Tap a line to go there · underlined words open their meaning · '}
          {repeats > 1 ? `${Math.min(rep.current + 1, repeats)} of ${repeats} · ` : ''}
          {chant.credit}
        </p>
      </footer>
    </section>
  )
}
