import { useEffect, useMemo, useRef, useState } from 'react'
import { CHAKRA_LIST } from '../chakra/chakras'
import { navigate } from '../router'
import { CHANTS } from './chants'
import { Icon } from './Icon'
import { Journey, JourneyMini } from './Journey'
import { ADDABLE, FIELDS, PRACTICES, PRESETS, plan, stepInfo, totalMinutes } from './library'
import { loadFeeling, loadPick, loadRecentTalks, loadSittings, loadTalk, rememberTalk, resetSitting, saveFeeling, savePick, saveSitting, saveTalk } from './store'
import type { Feeling, Step, Talk } from './types'
import { fetchTitle, formatClock, parseTime, parseYouTube, thumbnail } from './youtube'

const FEELINGS: { id: Feeling; label: string }[] = [
  { id: 'balanced', label: 'Balanced' },
  { id: 'left', label: 'Left side heavy' },
  { id: 'right', label: 'Right side heavy' },
]

const FEELING_NOTE: Record<Feeling, string> = {
  balanced: 'Nothing is added. Affirmations use the centre.',
  left: `Adds “${PRACTICES.candle.title}” after the opening, and the left-side affirmations.`,
  right: `Adds “${PRACTICES.ice.title}” after the opening, and the right-side affirmations.`,
}

type Ending = 'laps' | 'talk' | 'both'
const ENDINGS: { id: Ending; label: string }[] = [
  { id: 'laps', label: 'Mantra laps' },
  { id: 'talk', label: 'Shri Mataji talk' },
  { id: 'both', label: 'Both' },
]

/** One line on what a step does, for the editor. */
function describe(s: Step): string {
  switch (s.kind) {
    case 'prepare':
      return 'Raise the Kundalini three times, then a bandhan. Counted, nothing to read.'
    case 'chant':
      return CHANTS[s.chant].about
    case 'silence':
      return 'The chakra, a quiet timer and silence. A bell at the start and the end.'
    case 'laps':
      return 'The mantra screen: ten laps make a round.'
    case 'talk':
      return 'Plays the talk from the link below. It loads quietly while you do the earlier steps.'
    case 'remedy':
      return PRACTICES[s.remedy]?.when ?? ''
    case 'affirm':
      return 'Today’s side: centre when balanced, otherwise the heavy side.'
    case 'close':
      return 'A bandhan, then thanks.'
  }
}

const isEnter = (e: KeyboardEvent) =>
  e.key === 'Enter' && !(e.target instanceof HTMLElement && e.target.closest('input, textarea, select, button, a'))

/** The start screen: pick a sitting, shape it, add a talk, begin. */
export function Setup({ onBegin }: { onBegin: (steps: Step[], feeling: Feeling, talk: Talk | null) => void }) {
  const [sittings, setSittings] = useState(loadSittings)
  const [pick, setPick] = useState(() => {
    const p = loadPick()
    return PRESETS.some((s) => s.id === p) ? p : 'evening'
  })
  const [feeling, setFeeling] = useState<Feeling>(loadFeeling)
  const saved = useMemo(loadTalk, [])
  const [link, setLink] = useState(saved?.url ?? '')
  const [from, setFrom] = useState(saved?.start ? formatClock(saved.start) : '')
  const [to, setTo] = useState(saved?.end ? formatClock(saved.end) : '')
  const [title, setTitle] = useState<string | null>(saved?.title ?? null)
  const [selected, setSelected] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const recent = useMemo(loadRecentTalks, [])
  const panel = useRef<HTMLDivElement>(null)

  const sitting = sittings.find((s) => s.id === pick)!
  const preset = PRESETS.find((p) => p.id === pick)!
  const edited = JSON.stringify(sitting.steps) !== JSON.stringify(preset.steps)

  const update = (steps: Step[]) => {
    const next = { ...sitting, steps }
    setSittings((list) => list.map((s) => (s.id === next.id ? next : s)))
    saveSitting(next)
  }
  const set = (i: number, patch: Partial<Step>) => update(sitting.steps.map((s, k) => (k === i ? ({ ...s, ...patch } as Step) : s)))
  const move = (i: number, d: -1 | 1) => {
    const a = [...sitting.steps]
    const j = i + d
    if (j < 0 || j >= a.length) return
    ;[a[i], a[j]] = [a[j], a[i]]
    update(a)
    setSelected(j)
  }
  /** Drag or Alt+arrow: take the step out and put it back at its new place; the open editor follows it. */
  const reorder = (from: number, to: number) => {
    const a = [...sitting.steps]
    const [moved] = a.splice(from, 1)
    a.splice(to, 0, moved)
    update(a)
    setSelected((sel) => {
      if (sel === null) return null
      if (sel === from) return to
      if (from < sel && sel <= to) return sel - 1
      if (to <= sel && sel < from) return sel + 1
      return sel
    })
  }
  const remove = (i: number) => {
    update(sitting.steps.filter((_, k) => k !== i))
    setSelected(null)
  }
  const add = (step: Step) => {
    const close = sitting.steps.findIndex((s) => s.kind === 'close')
    const at = close === -1 ? sitting.steps.length : close
    update([...sitting.steps.slice(0, at), { ...step }, ...sitting.steps.slice(at)])
    setAdding(false)
    setSelected(at)
  }
  const reset = () => {
    const p = resetSitting(pick)
    setSittings((list) => list.map((s) => (s.id === p.id ? p : s)))
    setSelected(null)
  }
  const choose = (id: string) => {
    setPick(id)
    setSelected(null)
    setAdding(false)
  }

  // Bring the editor into view when a step is chosen (it sits under the strip).
  useEffect(() => {
    if (selected !== null || adding) panel.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [selected, adding])

  // ── Ending: laps, the talk, or both ──
  const lapsOn = sitting.steps.some((s) => s.kind === 'laps' && s.on)
  const talkOn = sitting.steps.some((s) => s.kind === 'talk' && s.on)
  const ending: Ending | null = lapsOn && talkOn ? 'both' : talkOn ? 'talk' : lapsOn ? 'laps' : null
  const setEnding = (e: Ending) => {
    const wantLaps = e !== 'talk'
    const wantTalk = e !== 'laps'
    let steps = sitting.steps.map((s) => (s.kind === 'laps' ? { ...s, on: wantLaps } : s.kind === 'talk' ? { ...s, on: wantTalk } : s))
    const insert = (step: Step) => {
      const close = steps.findIndex((s) => s.kind === 'close')
      const at = close === -1 ? steps.length : close
      steps = [...steps.slice(0, at), step, ...steps.slice(at)]
    }
    if (wantLaps && !steps.some((s) => s.kind === 'laps')) insert({ kind: 'laps', on: true, chakra: 'mooladhara', rounds: 1 })
    if (wantTalk && !steps.some((s) => s.kind === 'talk')) insert({ kind: 'talk', on: true })
    update(steps)
  }

  // ── Talk link ──
  const parsed = parseYouTube(link)
  const talk: Talk | null = parsed
    ? { url: link.trim(), id: parsed.id, start: from ? parseTime(from) : parsed.start, end: to ? parseTime(to) || undefined : undefined, title: title ?? undefined }
    : null
  useEffect(() => {
    if (!parsed) return setTitle(null)
    let live = true
    void fetchTitle(parsed.id).then((t) => live && t && setTitle(t))
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsed?.id])
  const pickRecent = (t: Talk) => {
    setLink(t.url)
    setFrom(t.start ? formatClock(t.start) : '')
    setTo(t.end ? formatClock(t.end) : '')
    setTitle(t.title ?? null)
  }

  const steps = plan(sitting, feeling, !!talk)
  const minutes = totalMinutes(steps)

  const begin = () => {
    if (!steps.length) return
    saveFeeling(feeling)
    savePick(pick)
    saveTalk(talk)
    if (talk && talkOn) rememberTalk(talk)
    onBegin(steps, feeling, talkOn ? talk : null)
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isEnter(e)) begin()
      else if (e.key === 'Escape') {
        setSelected(null)
        setAdding(false)
      }
    }
    addEventListener('keydown', onKey)
    return () => removeEventListener('keydown', onKey)
  })

  const t = FIELDS.white
  const vars = { '--field': t.field, '--ink': t.ink, '--ink-soft': t.inkSoft, '--glow': t.glow } as React.CSSProperties
  const sel = selected !== null ? sitting.steps[selected] : null
  const hasTalkStep = sitting.steps.some((s) => s.kind === 'talk')

  return (
    <main className="sx" style={vars}>
      <header className="sx-top">
        <a className="med-mark" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }} aria-label="SAHAJA YOGA, home">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3c2.2 2.5 3.3 5 3.3 7.6 0 2.7-1.4 4.9-3.3 6.4-1.9-1.5-3.3-3.7-3.3-6.4C8.7 8 9.8 5.5 12 3Zm-8.5 6.2c2.9.3 5.1 1.6 6.6 3.8.7 1 1.1 2.1 1.3 3.2-3.9-.2-7-3-7.9-7Zm17 0c-.9 4-4 6.8-7.9 7 .2-1.1.6-2.2 1.3-3.2 1.5-2.2 3.7-3.5 6.6-3.8ZM5 18.5h14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          <span>SAHAJA YOGA</span>
        </a>
        <a className="sx-out" href="/mooladhara" onClick={(e) => { e.preventDefault(); navigate('/mooladhara') }}>Mantra meditation</a>
      </header>

      <section className="sx-hero">
        <h1 className="sx-word">Sadhana</h1>
        <p className="sx-script">your daily sitting</p>
      </section>

      <div className="sx-presets" role="radiogroup" aria-label="Sitting">
        {sittings.map((s) => (
          <button key={s.id} role="radio" aria-checked={s.id === pick} className="sx-preset" onClick={() => choose(s.id)}>
            <span className="sx-preset-top">
              <span className="sx-preset-name">{s.name}</span>
              <span className="sx-preset-min">{totalMinutes(plan(s, 'balanced', !!talk))} min</span>
            </span>
            <span className="sx-preset-note">{s.note}</span>
            <JourneyMini steps={s.steps} />
          </button>
        ))}
      </div>

      <section className="sx-path" aria-labelledby="sx-path-h">
        <div className="sx-path-head">
          <h2 className="sx-h" id="sx-path-h">The sitting, step by step</h2>
          <p className="sx-sub">Drag a step to rearrange the sitting. Choose one to change it or switch it off.</p>
          {edited && <button className="sx-link" onClick={reset}>Reset {sitting.name.toLowerCase()}</button>}
        </div>
        <Journey
          steps={sitting.steps}
          label={`${sitting.name} sitting`}
          selected={selected}
          onSelect={(i) => {
            setAdding(false)
            setSelected(i === selected ? null : i)
          }}
          onAdd={() => {
            setSelected(null)
            setAdding((a) => !a)
          }}
          adding={adding}
          onReorder={reorder}
        />

        <div className="sx-panel-slot" ref={panel}>
          {sel && selected !== null && (
            <Editor
              key={`${pick}-${selected}`}
              step={sel}
              index={selected}
              count={sitting.steps.length}
              talkMissing={sel.kind === 'talk' && !talk}
              onSet={(p) => set(selected, p)}
              onMove={(d) => move(selected, d)}
              onRemove={() => remove(selected)}
              onClose={() => setSelected(null)}
            />
          )}
          {adding && (
            <div className="sx-panel sx-add" role="group" aria-label="Add a step">
              <div className="sx-panel-head">
                <h3 className="sx-panel-title">Add a step</h3>
                <button className="sx-icon" onClick={() => setAdding(false)} aria-label="Close"><Icon name="close" /></button>
              </div>
              {['Mantras', 'Meditation', 'Clearing', 'Affirmations'].map((g) => {
                const items = ADDABLE.filter((a) => a.group === g && !(a.step.kind === 'talk' && hasTalkStep))
                if (!items.length) return null
                return (
                  <div className="sx-add-group" key={g}>
                    <h4 className="sx-h4">{g}</h4>
                    <div className="sx-chips">
                      {items.map((a) => (
                        <button key={a.label} className="sx-chip" onClick={() => add(a.step)}>
                          <i className="sx-dot" style={{ background: stepInfo(a.step).theme.field }} />
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      <section className="sx-today" aria-label="Today">
        <div className="sx-field">
          <h3 className="sx-h3">Today I feel</h3>
          <div className="sx-seg" role="radiogroup" aria-label="Today I feel">
            {FEELINGS.map((f) => (
              <button key={f.id} role="radio" aria-checked={feeling === f.id} onClick={() => setFeeling(f.id)}>{f.label}</button>
            ))}
          </div>
          <p className="sx-note">{FEELING_NOTE[feeling]}</p>
        </div>

        <div className="sx-field">
          <h3 className="sx-h3">End with</h3>
          <div className="sx-seg" role="radiogroup" aria-label="End with">
            {ENDINGS.map((e) => (
              <button key={e.id} role="radio" aria-checked={ending === e.id} onClick={() => setEnding(e.id)}>{e.label}</button>
            ))}
          </div>
          <p className="sx-note">{ending === 'laps' ? 'The mantra screen closes the sitting.' : ending ? 'Paste the talk below.' : 'Neither is on in this sitting.'}</p>
        </div>

        {talkOn && (
          <div className="sx-field sx-talk">
            <label className="sx-h3" htmlFor="talk-link">Shri Mataji’s talk</label>
            <input id="talk-link" className="sx-input" inputMode="url" autoComplete="off" spellCheck={false} placeholder="Paste a YouTube link" value={link} onChange={(e) => setLink(e.target.value)} />
            {talk ? (
              <div className="sx-talk-card">
                <img src={thumbnail(talk.id)} alt="" width="128" height="72" />
                <div>
                  <p className="sx-talk-title">{title ?? 'YouTube talk'}</p>
                  <p className="sx-note">From {formatClock(talk.start)}{talk.end ? ` to ${formatClock(talk.end)}` : ' to the end'}</p>
                </div>
              </div>
            ) : (
              <p className="sx-note">{link.trim() ? 'That isn’t a YouTube link. Copy the address from the video’s Share button.' : 'Without a link, the talk is left out.'}</p>
            )}
            <div className="sx-times">
              <label>Start at <input className="sx-input" placeholder="0:00" value={from} onChange={(e) => setFrom(e.target.value)} /></label>
              <label>Stop at <input className="sx-input" placeholder="the end" value={to} onChange={(e) => setTo(e.target.value)} /></label>
            </div>
            {recent.length > 0 && (
              <div className="sx-chips">
                {recent.map((r) => (
                  <button key={r.id} className="sx-chip" onClick={() => pickRecent(r)}>{r.title ?? r.id}</button>
                ))}
              </div>
            )}
            <p className="sx-note">It loads quietly when you begin, so it’s ready by the time you reach it.</p>
          </div>
        )}
      </section>

      <footer className="sx-begin">
        <p className="sx-begin-sum">
          <b>{sitting.name}</b>
          <span>{steps.length} {steps.length === 1 ? 'step' : 'steps'} · about {minutes} min</span>
        </p>
        <span className="sx-kbd" aria-hidden="true"><kbd>Enter</kbd></span>
        <button className="sx-go" onClick={begin} disabled={!steps.length}>
          Begin
          <Icon name="right" />
        </button>
      </footer>
    </main>
  )
}

type EditorProps = {
  step: Step
  index: number
  count: number
  talkMissing: boolean
  onSet: (p: Partial<Step>) => void
  onMove: (d: -1 | 1) => void
  onRemove: () => void
  onClose: () => void
}

/** The chosen step: what it is, its few settings, and where it sits. */
function Editor({ step: s, index, count, talkMissing, onSet, onMove, onRemove, onClose }: EditorProps) {
  const info = stepInfo(s)
  const minutes = s.kind === 'remedy' ? s.minutes ?? PRACTICES[s.remedy]?.minutes ?? 5 : 0
  return (
    <div className="sx-panel" role="group" aria-label={`Step ${index + 1}: ${info.title}`}>
      <div className="sx-panel-head">
        <span className="sx-swatch" style={{ background: info.theme.field }} aria-hidden="true" />
        <div className="sx-panel-what">
          <h3 className="sx-panel-title">{info.title}</h3>
          <p className="sx-note">{info.category} · {describe(s)}</p>
        </div>
        <button className="sx-switch" role="switch" aria-checked={s.on} onClick={() => onSet({ on: !s.on })}>
          <i aria-hidden="true" />
          <span>{s.on ? 'In the sitting' : 'Left out'}</span>
        </button>
        <button className="sx-icon" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
      </div>

      <div className="sx-panel-controls">
        {(s.kind === 'silence' || s.kind === 'laps' || s.kind === 'affirm') && (
          <div className="sx-control">
            <span className="sx-control-label">Chakra</span>
            <div className="sx-seg is-small" role="radiogroup" aria-label="Chakra">
              {CHAKRA_LIST.map((c) => (
                <button key={c.slug} role="radio" aria-checked={s.chakra === c.slug} onClick={() => onSet({ chakra: c.slug })}>
                  <i className="sx-dot" style={{ background: c.theme.field }} />
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        )}
        {s.kind === 'chant' && (
          <div className="sx-control">
            <span className="sx-control-label">Chant</span>
            <div className="sx-seg is-small" role="radiogroup" aria-label="How to chant">
              <button role="radio" aria-checked={s.mode === 'follow'} onClick={() => onSet({ mode: 'follow' })}>With the recording</button>
              <button role="radio" aria-checked={s.mode === 'recite'} onClick={() => onSet({ mode: 'recite' })}>Recite</button>
            </div>
          </div>
        )}
        {s.kind === 'chant' && <Stepper label="Times" value={s.repeats} min={1} max={21} unit="×" onChange={(v) => onSet({ repeats: v })} />}
        {s.kind === 'silence' && <Stepper label="Length" value={s.minutes} min={1} max={60} unit="min" onChange={(v) => onSet({ minutes: v })} />}
        {s.kind === 'laps' && <Stepper label="Rounds" value={s.rounds} min={1} max={12} unit={s.rounds === 1 ? 'round' : 'rounds'} onChange={(v) => onSet({ rounds: v })} />}
        {s.kind === 'remedy' && <Stepper label="Length" value={minutes} min={1} max={30} unit="min" onChange={(v) => onSet({ minutes: v })} />}
        {talkMissing && <p className="sx-note">Paste the talk’s link under “Shri Mataji’s talk” below, or it is left out.</p>}
      </div>

      <div className="sx-panel-foot">
        <button className="sx-tool" onClick={() => onMove(-1)} disabled={index === 0}><Icon name="left" size={18} />Earlier</button>
        <button className="sx-tool" onClick={() => onMove(1)} disabled={index === count - 1}>Later<Icon name="right" size={18} /></button>
        <button className="sx-tool is-quiet" onClick={onRemove}><Icon name="trash" size={18} />Remove</button>
      </div>
    </div>
  )
}

function Stepper({ label, value, min, max, unit, onChange }: { label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void }) {
  return (
    <div className="sx-control">
      <span className="sx-control-label">{label}</span>
      <span className="sx-stepper">
        <button onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`Less, now ${value} ${unit}`}><Icon name="minus" size={18} /></button>
        <b aria-live="polite">{value}<small>{unit}</small></b>
        <button onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label={`More, now ${value} ${unit}`}><Icon name="plus" size={18} /></button>
      </span>
    </div>
  )
}
