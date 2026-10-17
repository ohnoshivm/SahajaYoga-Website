import { useEffect, useRef, useState } from 'react'
import type { Chakra } from '../chakra/chakras'
import { DAILY, GUIDES, PREPARE, type Affirmation, type HandPoint, type Remedy, type Side } from '../chakra/guides'
import { formatTime } from '../engine/session'

type Tab = 'understand' | 'words' | 'clear' | 'affirm' | 'feel'
const TABS: { id: Tab; label: string }[] = [
  { id: 'understand', label: 'Understand' },
  { id: 'words', label: 'Words' },
  { id: 'clear', label: 'Clear' },
  { id: 'affirm', label: 'Affirm' },
  { id: 'feel', label: 'Feel' },
]

const SIDE_LABEL: Record<Side, string> = { left: 'Left', right: 'Right', centre: 'Centre', all: 'All' }

const AFFIRM_SIDES: { side: Side; title: string; form: string }[] = [
  { side: 'centre', title: 'Centre', form: 'Please make me…' },
  { side: 'left', title: 'Left side', form: 'By Your grace, I am…' },
  { side: 'right', title: 'Right side', form: 'Verily You are…' },
]

const shield = {
  onPointerDown: (e: React.SyntheticEvent) => e.stopPropagation(),
  onPointerUp: (e: React.SyntheticEvent) => e.stopPropagation(),
}

export function GuidePanel({ chakra, onClose }: { chakra: Chakra; onClose: () => void }) {
  const guide = GUIDES[chakra.slug]
  const [tab, setTab] = useState<Tab>('understand')
  const body = useRef<HTMLDivElement>(null)

  useEffect(() => {
    body.current?.scrollTo({ top: 0 })
  }, [tab])

  if (!guide) return null

  return (
    <aside className="guide" role="dialog" aria-label={`${chakra.name} guide`} {...shield}>
      <header className="guide-head">
        <div>
          <p className="guide-k">{String(chakra.number).padStart(2, '0')} · Guide</p>
          <h2>{chakra.name}</h2>
        </div>
        <button className="guide-close" onClick={onClose} aria-label="Close guide">
          <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </header>

      <div className="guide-tabs" role="tablist" aria-label="Guide sections">
        {TABS.map((t) => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} className={tab === t.id ? 'is-on' : ''} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="guide-body" ref={body} role="tabpanel">
        {tab === 'understand' && (
          <div className="g-understand" key="u">
            {guide.meaning && <p className="g-meaning">{guide.meaning}</p>}
            <p className="g-big">{chakra.quality}</p>
            {guide.overview.map((p, i) => <p className="g-text" key={i}>{p}</p>)}

            <div className="g-petals">
              <span className="g-petals-n">{guide.petals.count.toLocaleString()}</span>
              <div>
                <p className="g-label">{guide.petals.label}</p>
                {guide.petals.items && <ul className="g-chips">{guide.petals.items.map((x) => <li key={x}>{x}</li>)}</ul>}
                {guide.petals.text && <p className="g-small">{guide.petals.text}</p>}
              </div>
            </div>

            <p className="g-label g-label-gap">Qualities</p>
            <dl className="g-qualities">
              {guide.qualities.map((q) => (
                <div key={q.name}><dt>{q.name}</dt><dd>{q.text}</dd></div>
              ))}
            </dl>

            <p className="g-label g-label-gap">Left, centre, right</p>
            <div className="g-sides">
              {guide.sides.map((x) => (
                <section key={x.side} className={`g-side is-${x.side}`}>
                  <h4>{x.title}</h4>
                  <p>{x.text}</p>
                </section>
              ))}
            </div>

            <dl className="g-facts g-label-gap">
              <div><dt>Where</dt><dd>{guide.facts.where}</dd></div>
              <div><dt>Element</dt><dd>{guide.facts.element}</dd></div>
              <div><dt>Colour</dt><dd>{guide.facts.colour}</dd></div>
              <div><dt>Felt</dt><dd>{guide.facts.felt}</dd></div>
            </dl>

            <div className="g-two">
              <div>
                <p className="g-label">What disturbs it</p>
                <ul className="g-list">{guide.disturbs.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
              <div>
                <p className="g-label">You may notice</p>
                <ul className="g-list">{guide.signs.map((x) => <li key={x}>{x}</li>)}</ul>
              </div>
            </div>
            <p className="g-label">As it opens</p>
            <ul className="g-list g-list-grow">{guide.grows.map((x) => <li key={x}>{x}</li>)}</ul>
          </div>
        )}

        {tab === 'words' && (
          <div className="g-words" key="w">
            {guide.story && (
              <section className="g-story">
                <p className="g-label">{guide.story.date}</p>
                <h3>{guide.story.title}</h3>
                {guide.story.paragraphs.map((p, i) => <p className="g-text" key={i}>{p}</p>)}
                <figure className="g-pull">
                  <blockquote>“{guide.story.quote.text}”</blockquote>
                  <figcaption>{guide.story.quote.source}</figcaption>
                </figure>
              </section>
            )}
            {guide.quotes.map((q, i) => (
              <figure className="g-pull" key={i}>
                <blockquote>“{q.text}”</blockquote>
                <figcaption>{q.source}</figcaption>
              </figure>
            ))}
          </div>
        )}

        {tab === 'clear' && (
          <div className="g-clear" key="c">
            {guide.remedies.map((r, i) => <RemedyCard key={r.id} remedy={r} index={i + 1} />)}
            <p className="g-label g-label-gap">Before every meditation</p>
            {PREPARE.map((r) => <RemedyCard key={r.id} remedy={r} compact />)}
            <p className="g-label g-label-gap">Every day</p>
            <dl className="g-facts">
              {DAILY.map((d) => <div key={d.time}><dt>{d.time}</dt><dd>{d.text}</dd></div>)}
            </dl>
          </div>
        )}

        {tab === 'affirm' && (
          <div className="g-affirms" key="a">
            <p className="g-text">Begin with “Mother”, “Kundalini” or “Shri Mataji”. Say it from the heart, aloud or silently, with your attention on the chakra.</p>
            {AFFIRM_SIDES.map(({ side, title, form }) => {
              const list = guide.affirmations.filter((a) => a.side === side)
              if (!list.length) return null
              return (
                <section key={side} className="g-affirm-group">
                  <p className="g-label g-label-gap">{title} <span className="g-form">{form}</span></p>
                  {list.map((a) => <Affirm key={a.text} a={a} />)}
                </section>
              )
            })}
          </div>
        )}

        {tab === 'feel' && (
          <div className="g-feel" key="f">
            <div className="g-hands">
              <Hand point={guide.feel.point} label="Left hand" />
              <Hand point={guide.feel.point} label="Right hand" mirror />
            </div>
            <p className="g-text">{guide.feel.text}</p>
            <dl className="g-facts">
              <div><dt>Left hand</dt><dd>The left side: emotions, the past</dd></div>
              <div><dt>Right hand</dt><dd>The right side: action, the future</dd></div>
              <div><dt>Both hands</dt><dd>The centre channel</dd></div>
            </dl>
          </div>
        )}
      </div>

      <p className="guide-source">From the Sahaja Yoga chakra guides</p>
    </aside>
  )
}

function RemedyCard({ remedy, index, compact }: { remedy: Remedy; index?: number; compact?: boolean }) {
  const total = (remedy.minutes ?? 0) * 60_000
  const [left, setLeft] = useState<number | null>(null)
  const [running, setRunning] = useState(false)
  const endsAt = useRef(0)
  const [open, setOpen] = useState(!compact)

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const ms = Math.max(0, endsAt.current - Date.now())
      setLeft(ms)
      if (ms === 0) setRunning(false)
    }, 250)
    return () => clearInterval(id)
  }, [running])

  const start = () => {
    endsAt.current = Date.now() + (left && left > 0 ? left : total)
    setLeft(endsAt.current - Date.now())
    setRunning(true)
  }
  const pause = () => setRunning(false)
  const reset = () => {
    setRunning(false)
    setLeft(null)
  }

  const active = left !== null
  const done = active && left === 0
  const progress = active && total ? 1 - (left ?? 0) / total : 0
  // Walk through the steps across the timer, so the card shows what to do now.
  const stepNow = active && total ? Math.min(remedy.steps.length - 1, Math.floor(progress * remedy.steps.length)) : -1

  return (
    <section className={`g-remedy ${compact ? 'is-compact' : ''} ${active ? 'is-active' : ''}`}>
      <button className="g-remedy-head" onClick={() => compact && setOpen((o) => !o)} aria-expanded={open} disabled={!compact} tabIndex={compact ? 0 : -1}>
        {index !== undefined && <span className="g-num">{String(index).padStart(2, '0')}</span>}
        <span className="g-remedy-title">{remedy.title}</span>
        {remedy.side && !compact && <span className="g-side-tag">{SIDE_LABEL[remedy.side]}</span>}
        {remedy.minutes && <span className="g-pill">{remedy.minutes} min</span>}
        {compact && (
          <svg className="g-chev" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 6.2 8 10l4-3.8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
        )}
      </button>
      {open && (
        <>
          {remedy.when && !active && <p className="g-when">{remedy.when}</p>}
          {active && (
            <div className="g-timer" aria-live="polite">
              <span className="g-timer-time">{done ? 'Complete' : formatTime(left ?? 0)}</span>
              <span className="g-bar"><i style={{ transform: `scaleX(${progress})` }} /></span>
            </div>
          )}
          <ol className="g-steps">
            {remedy.steps.map((s, i) => (
              <li key={i} className={i === stepNow && !done ? 'is-now' : i < stepNow || done ? 'is-past' : ''}>{s}</li>
            ))}
          </ol>
          {remedy.minutes && (
            <div className="g-actions">
              {!running && !done && <button className="g-btn" onClick={start}>{active ? 'Resume' : 'Begin'}</button>}
              {running && <button className="g-btn" onClick={pause}>Pause</button>}
              {active && <button className="g-btn g-btn-quiet" onClick={reset}>{done ? 'Again' : 'Reset'}</button>}
            </div>
          )}
        </>
      )}
    </section>
  )
}

function Affirm({ a }: { a: Affirmation }) {
  const [count, setCount] = useState(0)
  const done = count >= a.times
  const say = () => {
    if (done) return
    const next = count + 1
    setCount(next)
  }
  return (
    <section className="g-affirm">
      {a.position && <p className="g-label">{a.position}</p>}
      <blockquote className="g-quote">“{a.text}”</blockquote>
      <div className="g-dots" aria-label={`${count} of ${a.times}`}>
        {Array.from({ length: a.times }, (_, i) => <i key={i} className={i < count ? 'is-on' : ''} />)}
      </div>
      <div className="g-actions">
        <button className="g-btn" onClick={say} disabled={done}>{done ? 'Complete' : `Say it · ${count + 1} of ${a.times}`}</button>
        {count > 0 && <button className="g-btn g-btn-quiet" onClick={() => setCount(0)}>Again</button>}
      </div>
      {a.note && <p className="g-small">{a.note}</p>}
      <p className="g-source">{a.source}</p>
    </section>
  )
}

const POINTS: Record<HandPoint, [number, number]> = {
  heel: [53, 152],
  centre: [54, 104],
  thumb: [17, 90],
  index: [39.5, 32],
  middle: [50.5, 21],
  ring: [61.5, 28],
  little: [72, 46],
}

function Hand({ point, label, mirror }: { point: HandPoint; label: string; mirror?: boolean }) {
  const [x, y] = POINTS[point]
  return (
    <figure className="g-hand">
      <svg viewBox="0 0 90 176" role="img" aria-label={`${label}, palm up`} style={mirror ? { transform: 'scaleX(-1)' } : undefined}>
        <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
          <path d="M30 168 V130 C16 118 8 102 10 88 C11 80 20 78 26 86 L34 100 V36 C34 26 45 26 45 36 V24 C45 13 56 13 56 24 V30 C56 20 67 20 67 30 V48 C67 39 77 39 77 48 V114 C77 130 71 142 64 148 V168" />
          <path d="M45 36 V64 M56 30 V62 M67 48 V66" opacity="0.35" />
        </g>
        <circle cx={x} cy={y} r="13" className="g-glow" />
        <circle cx={x} cy={y} r="5" className="g-dot" />
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  )
}
