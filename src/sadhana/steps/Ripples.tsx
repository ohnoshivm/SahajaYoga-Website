import type { Ripple } from './common'

export function Ripples({ ripples }: { ripples: Ripple[] }) {
  return (
    <div className="st-ripples" aria-hidden="true">
      {ripples.map((r) => <span key={r.id} style={{ left: r.x, top: r.y }} />)}
    </div>
  )
}
