import { useEffect, useRef, useState } from 'react'
import { navigate } from '../router'
import { CHAPTERS, HERO_FIELD } from './data'
import { HandMap } from './HandMap'
import { CH } from './scene/shared'
import { World } from './scene/World'
import { goTo, LAST, smoothstep, TOTAL_VH, useJourneyFrame, useSmoothScroll } from './scroll'
import 'lenis/dist/lenis.css'
import './home.css'

const hex = (h: string) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16))
const FIELDS = CHAPTERS.map((c) => hex(c.field))

/** The journey's solid field: holds through each chapter, crossfades between. */
function fieldAt(t: number): number[] {
  const x = Math.max(0, t)
  const i = Math.min(FIELDS.length - 2, Math.floor(x))
  const e = smoothstep(0.35, 0.65, x - i)
  return FIELDS[i].map((v, k) => Math.round(v + (FIELDS[i + 1][k] - v) * e))
}

/** The night opens out of the lotus: a circle that widens as the hero gives way. */
const revealAt = (t: number) => smoothstep(-0.78, -0.12, t)

/** Ink text on the ivory hero and the coral close; ivory text through the dark journey. */
const toneAt = (t: number) => (revealAt(t) < 0.42 || t > CH.begin - 0.5 ? 'light' : 'dark')

const go = (href: string) => (e: React.MouseEvent) => {
  if (e.metaKey || e.ctrlKey) return
  e.preventDefault()
  navigate(href)
}

function Arrow() {
  return (
    <svg className="arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6.5 18.5 12 13 17.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LotusMark() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 3c2.2 2.5 3.3 5 3.3 7.6 0 2.7-1.4 4.9-3.3 6.4-1.9-1.5-3.3-3.7-3.3-6.4C8.7 8 9.8 5.5 12 3Zm-8.5 6.2c2.9.3 5.1 1.6 6.6 3.8.7 1 1.1 2.1 1.3 3.2-3.9-.2-7-3-7.9-7Zm17 0c-.9 4-4 6.8-7.9 7 .2-1.1.6-2.2 1.3-3.2 1.5-2.2 3.7-3.5 6.6-3.8ZM5 18.5h14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function HomePage() {
  useSmoothScroll()
  const root = useRef<HTMLDivElement>(null)
  const field = useRef<HTMLDivElement>(null)
  const night = useRef<HTMLDivElement>(null)
  const heroType = useRef<HTMLDivElement>(null)
  const heroFoot = useRef<HTMLDivElement>(null)
  const ghost = useRef<HTMLDivElement>(null)
  const chapters = useRef<(HTMLElement | null)[]>([])
  const hands = useRef<HTMLDivElement>(null)
  const index = useRef<HTMLElement>(null)
  const [active, setActive] = useState(-1)
  const last = useRef({ field: '', tone: '', active: -2 })

  // Deep links: /#ida opens the journey at that chapter.
  useEffect(() => {
    const id = decodeURIComponent(location.hash.slice(1))
    const i = CHAPTERS.findIndex((c) => c.id === id)
    if (i >= 0) requestAnimationFrame(() => goTo(i, true))
  }, [])

  useEffect(() => {
    if (active < 0) {
      if (location.hash) history.replaceState(null, '', location.pathname)
      return
    }
    history.replaceState(null, '', `#${CHAPTERS[active].id}`)
  }, [active])

  useEffect(() => {
    document.title = 'SAHAJA YOGA · Your own awakening'
    document.body.style.background = HERO_FIELD
    document.documentElement.classList.add('is-home')
    return () => document.documentElement.classList.remove('is-home')
  }, [])

  useJourneyFrame((t) => {
    const r = root.current
    if (!r) return

    const [cr, cg, cb] = fieldAt(t)
    const col = `rgb(${cr}, ${cg}, ${cb})`
    const reveal = revealAt(t)
    if (night.current) {
      if (col !== last.current.field) night.current.style.backgroundColor = col
      // Eased so it blooms from a point, then sweeps to the corners.
      const r = reveal >= 1 ? 160 : Math.pow(reveal, 1.6) * 160
      night.current.style.clipPath = reveal >= 1 ? 'none' : `circle(${r.toFixed(2)}% at 50% 30%)`
    }
    const meta = reveal < 0.5 ? HERO_FIELD : col
    if (meta !== last.current.field) {
      last.current.field = meta
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', meta)
    }
    const tone = toneAt(t)
    if (tone !== last.current.tone) {
      last.current.tone = tone
      r.dataset.tone = tone
    }

    // The hero's words part and fade as the lotus is drawn up to the crown.
    const spread = smoothstep(-1, -0.45, t)
    if (heroType.current) {
      heroType.current.style.setProperty('--spread', String(spread))
      heroType.current.style.opacity = String(1 - smoothstep(-0.92, -0.5, t))
    }
    if (heroFoot.current) heroFoot.current.style.opacity = String(1 - smoothstep(-0.97, -0.78, t))
    // The name returns as a ghost behind the figure, then steps back for the journey.
    if (ghost.current) ghost.current.style.opacity = (0.1 * smoothstep(-0.45, -0.05, t) * (1 - smoothstep(0.35, 0.75, t))).toFixed(3)

    chapters.current.forEach((el, i) => {
      if (!el) return
      const d = t - i
      const o = 1 - smoothstep(0.22, 0.46, Math.abs(d))
      el.style.opacity = o.toFixed(3)
      el.style.transform = `translate3d(0, ${(-d * 46).toFixed(1)}px, 0)`
      el.style.visibility = o < 0.01 ? 'hidden' : 'visible'
      el.style.pointerEvents = o > 0.6 ? 'auto' : 'none'
    })
    if (hands.current) {
      const o = 1 - smoothstep(0.2, 0.45, Math.abs(t - CH.hands))
      hands.current.style.opacity = o.toFixed(3)
      hands.current.style.visibility = o < 0.01 ? 'hidden' : 'visible'
    }
    if (index.current) {
      const show = smoothstep(-0.45, -0.1, t) * (1 - smoothstep(LAST - 0.6, LAST - 0.2, t))
      index.current.style.opacity = show.toFixed(3)
      index.current.style.pointerEvents = show > 0.5 ? 'auto' : 'none'
    }
    const a = t < -0.5 ? -1 : Math.max(0, Math.min(LAST, Math.round(t)))
    if (a !== last.current.active) {
      last.current.active = a
      setActive(a)
    }
  })

  return (
    <div className="home" ref={root} data-tone="light">
      <div className="home-field" ref={field} />
      <div className="home-night" ref={night} />

      <div className="hero-type" ref={heroType} aria-hidden="true">
        <span className="hero-w hero-w-l"><span>SAHAJA</span></span>
        <span className="hero-w hero-w-r"><span>YOGA</span></span>
      </div>

      <div className="ghost-type" ref={ghost} aria-hidden="true">SAHAJA YOGA</div>

      <World />

      <header className="home-nav">
        <a className="home-mark" href="/" onClick={(e) => { e.preventDefault(); goTo(-1) }} aria-label="SAHAJA YOGA, back to the top">
          <LotusMark />
          <span>SAHAJA YOGA</span>
        </a>
        <nav aria-label="Main">
          <button onClick={() => goTo(0)}>The subtle system</button>
          <a href="/sadhana" onClick={go('/sadhana')}>Meditate</a>
          <a href="https://www.shrimataji.org" target="_blank" rel="noopener noreferrer">Shri Mataji</a>
          <a href="https://www.sahajayoga.org" target="_blank" rel="noopener noreferrer">Find a class</a>
        </nav>
      </header>

      <h1 className="sr-only">Sahaja Yoga: your own awakening, spontaneous and free</h1>

      <div className="hero-foot" ref={heroFoot}>
        <p className="hero-tag">Your own awakening. Spontaneous, and free.</p>
        <button className="hero-cue" onClick={() => goTo(0)}>
          <span>Scroll into the subtle system</span>
          <i aria-hidden="true" />
        </button>
        <p className="hero-date">5 May 1970 · Nargol</p>
      </div>

      <div className="chapters">
        {CHAPTERS.map((c, i) => (
          <article
            key={c.id}
            className={`ch ch-${c.id}${c.id === 'begin' ? ' ch-begin' : ''}`}
            ref={(el) => {
              chapters.current[i] = el
            }}
            aria-label={c.title}
          >
            <h2 className="ch-title">{c.title}</h2>
            <p className="ch-sub">
              {c.swatch && <i className="ch-swatch" style={{ background: c.swatch }} aria-hidden="true" />}
              {c.sub}
            </p>
            <p className="ch-text">{c.text}</p>
            {c.facts && (
              <dl className="ch-facts">
                {c.facts.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            )}
            {c.link && (
              <a className="ch-link" href={c.link.href} onClick={go(c.link.href)}>
                {c.link.label}
                <Arrow />
              </a>
            )}
            {c.id === 'begin' && (
              <div className="ch-ctas">
                <a className="ch-go" href="/sadhana" onClick={go('/sadhana')}>Begin a sitting</a>
                <a className="ch-link" href="/mooladhara" onClick={go('/mooladhara')}>
                  Meditate on a chakra
                  <Arrow />
                </a>
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="hands-layer" ref={hands} aria-hidden={Math.abs(active - CH.hands) > 0}>
        <HandMap />
      </div>

      <nav className="jindex" ref={index} aria-label="Journey">
        {CHAPTERS.map((c, i) => (
          <button key={c.id} onClick={() => goTo(i)} aria-current={active === i ? 'step' : undefined}>
            <span>{c.title}</span>
            <i aria-hidden="true" />
          </button>
        ))}
      </nav>

      <div className="home-scroll" style={{ height: `${TOTAL_VH * 100}vh` }} aria-hidden="true" />

      <footer className="home-foot">
        <div className="home-foot-brand">
          <LotusMark />
          <span>SAHAJA YOGA</span>
        </div>
        <nav aria-label="Practice">
          <a href="/sadhana" onClick={go('/sadhana')}>Sadhana, your daily sitting</a>
          <a href="/mooladhara" onClick={go('/mooladhara')}>Mooladhara meditation</a>
          <a href="/sahasrara" onClick={go('/sahasrara')}>Sahasrara meditation</a>
        </nav>
        <p>Sahaja Yoga is always free. Content drawn from sahajayoga.org and shrimataji.org.</p>
      </footer>
    </div>
  )
}
