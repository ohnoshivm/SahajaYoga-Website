import { useEffect, useRef } from 'react'
import { navigate } from '../router'
import { completed, type SitState } from './engine'
import { Journey } from './Journey'
import { FIELDS, stepInfo } from './library'
import { saveSittingHistory } from './store'

export function Summary({ state, onAgain }: { state: SitState; onAgain: () => void }) {
  const done = completed(state)
  const minutes = Math.max(1, Math.round(state.banked / 60_000))

  // Once per finished sitting, even when effects run twice in development.
  const saved = useRef(false)
  useEffect(() => {
    if (saved.current) return
    saved.current = true
    saveSittingHistory({
      endedAt: Date.now(),
      durationMs: state.banked,
      steps: state.steps.length,
      completed: done.size,
      titles: state.steps.map((s) => stepInfo(s).title),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const t = FIELDS.white
  const vars = { '--field': t.field, '--ink': t.ink, '--ink-soft': t.inkSoft, '--glow': t.glow } as React.CSSProperties

  return (
    <main className="sx sx-summary" style={vars}>
      <section className="sx-hero">
        <h1 className="sx-word">Complete</h1>
        <p className="sx-script">Thank You, Mother</p>
      </section>
      <p className="sx-lede">
        {minutes} {minutes === 1 ? 'minute' : 'minutes'}, {done.size} of {state.steps.length} steps.
      </p>
      <Journey
        steps={state.steps}
        label="This sitting"
        status={(i) => (done.has(i) ? 'done' : i <= state.index ? 'skipped' : 'unreached')}
      />
      <div className="sx-summary-actions">
        <button className="sx-go" onClick={onAgain} autoFocus>Another sitting</button>
        <a className="sx-out" href="/mooladhara" onClick={(e) => { e.preventDefault(); navigate('/mooladhara') }}>Mantra meditation</a>
      </div>
      <p className="sx-note">Saved to your practice on this device.</p>
    </main>
  )
}
