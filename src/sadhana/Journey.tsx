import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Icon } from './Icon'
import { stepInfo } from './library'
import type { Step } from './types'

export type StepStatus = 'done' | 'skipped' | 'unreached'

/** Width of a step in the strip: grows with its minutes, compressed so a 10-minute soak doesn't dwarf a 2-minute mantra. */
const weight = (s: Step) => Math.max(1, Math.sqrt(stepInfo(s).minutes || 4))

/** A sitting drawn as its sequence of colour fields, each as wide as it is long. */
export function JourneyMini({ steps }: { steps: Step[] }) {
  return (
    <span className="jr-mini" aria-hidden="true">
      {steps
        .filter((s) => s.on)
        .map((s, i) => (
          <i key={i} style={{ flexGrow: weight(s), background: stepInfo(s).theme.field }} />
        ))}
    </span>
  )
}

type Props = {
  steps: Step[]
  label: string
  selected?: number | null
  onSelect?: (i: number) => void
  status?: (i: number) => StepStatus
  onAdd?: () => void
  adding?: boolean
  /** Makes the strip rearrangeable: drag a block, or Alt + arrow keys on a focused one. */
  onReorder?: (from: number, to: number) => void
}

/** A press that travels this far is a drag, not a tap. */
const DRAG_PX = 6
/** How long a dropped block takes to settle into its slot. */
const SETTLE_MS = 200

type Gesture = { pointer: number; from: number; axis: 'x' | 'y'; start: number; rects: DOMRect[]; gap: number; moved: boolean }
type Drag = { from: number; over: number; delta: number; settling: boolean; axis: 'x' | 'y'; room: number }

const lo = (r: DOMRect, axis: 'x' | 'y') => (axis === 'x' ? r.left : r.top)
const size = (r: DOMRect, axis: 'x' | 'y') => (axis === 'x' ? r.width : r.height)
const mid = (r: DOMRect, axis: 'x' | 'y') => lo(r, axis) + size(r, axis) / 2

export function Journey({ steps, label, selected, onSelect, status, onAdd, adding, onReorder }: Props) {
  const items = useRef<(HTMLLIElement | null)[]>([])
  const gesture = useRef<Gesture | null>(null)
  const swallowClick = useRef(false)
  const refocus = useRef<number | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  // Transitions off for the one frame where the new order replaces the shifted blocks, so nothing jumps.
  const [quiet, setQuiet] = useState(false)

  useEffect(() => {
    if (refocus.current === null) return
    items.current[refocus.current]?.querySelector('button')?.focus()
    refocus.current = null
  }, [steps])

  const commit = (from: number, to: number) => {
    setQuiet(true)
    if (to !== from) onReorder?.(from, to)
    setDrag(null)
    requestAnimationFrame(() => requestAnimationFrame(() => setQuiet(false)))
  }

  const down = (e: React.PointerEvent, i: number) => {
    if (!onReorder || e.button !== 0 || drag?.settling) return
    // On touch the strip scrolls; drag starts only from the grip.
    if (e.pointerType === 'touch' && !(e.target as HTMLElement).closest('.jr-grip')) return
    const list = e.currentTarget.parentElement!
    const axis = getComputedStyle(list).flexDirection.startsWith('column') ? 'y' : 'x'
    const rects = steps.map((_, k) => items.current[k]!.getBoundingClientRect())
    const gap = rects.length > 1 ? lo(rects[1], axis) - (lo(rects[0], axis) + size(rects[0], axis)) : 6
    gesture.current = { pointer: e.pointerId, from: i, axis, start: axis === 'x' ? e.clientX : e.clientY, rects, gap, moved: false }
  }

  const move = (e: React.PointerEvent) => {
    const g = gesture.current
    if (!g || e.pointerId !== g.pointer) return
    const delta = (g.axis === 'x' ? e.clientX : e.clientY) - g.start
    if (!g.moved) {
      if (Math.abs(delta) < DRAG_PX) return
      g.moved = true
      e.currentTarget.setPointerCapture(e.pointerId)
    }
    const c = mid(g.rects[g.from], g.axis) + delta
    let over = g.from
    for (let k = g.from + 1; k < g.rects.length; k++) if (c > mid(g.rects[k], g.axis)) over = k
    for (let k = g.from - 1; k >= 0; k--) if (c < mid(g.rects[k], g.axis)) over = k
    setDrag({ from: g.from, over, delta, settling: false, axis: g.axis, room: size(g.rects[g.from], g.axis) + g.gap })
  }

  const up = (e: React.PointerEvent) => {
    const g = gesture.current
    gesture.current = null
    if (!g || e.pointerId !== g.pointer || !g.moved || !drag) return
    swallowClick.current = true
    // Glide into the slot the others have opened, then take the new order.
    const { from, over } = drag
    const r = g.rects
    const target = over > from ? lo(r[over], g.axis) + size(r[over], g.axis) - size(r[from], g.axis) : lo(r[over], g.axis)
    setDrag({ ...drag, delta: target - lo(r[from], g.axis), settling: true })
    window.setTimeout(() => commit(from, over), SETTLE_MS)
  }

  const cancel = () => {
    gesture.current = null
    if (drag && !drag.settling) setDrag(null)
  }

  const keys = (e: React.KeyboardEvent, i: number) => {
    if (!onReorder || !e.altKey) return
    const d = e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : 0
    if (!d || i + d < 0 || i + d >= steps.length) return
    e.preventDefault()
    refocus.current = i + d
    onReorder(i, i + d)
  }

  /** Where each block sits while one is being dragged. */
  const shift = (k: number): string | undefined => {
    if (!drag) return undefined
    const t = (v: number) => (drag.axis === 'x' ? `translate3d(${v}px, 0, 0)` : `translate3d(0, ${v}px, 0)`)
    if (k === drag.from) return t(drag.delta)
    if (drag.over > drag.from && k > drag.from && k <= drag.over) return t(-drag.room)
    if (drag.over < drag.from && k >= drag.over && k < drag.from) return t(drag.room)
    return undefined
  }

  return (
    <ol className={`jr ${drag ? 'is-dragging' : ''} ${quiet ? 'is-quiet' : ''}`} aria-label={label}>
      {steps.map((s, i) => {
        const info = stepInfo(s)
        const st = status?.(i)
        const lifted = drag?.from === i
        const inner = (
          <>
            <span className="jr-n">{i + 1}</span>
            <span className="jr-title">{info.title}</span>
            <span className="jr-d">{!s.on ? 'Off' : st === 'skipped' ? 'Skipped' : st === 'unreached' ? 'Not reached' : info.detail}</span>
            {onReorder && <span className="jr-grip" aria-hidden="true"><Icon name="grip" size={18} /></span>}
          </>
        )
        return (
          <li
            key={i}
            ref={(el) => {
              items.current[i] = el
            }}
            className={`jr-step ${s.on ? '' : 'is-off'} ${selected === i ? 'is-selected' : ''} ${st ? `is-${st}` : ''} ${lifted ? 'is-lifted' : ''} ${lifted && drag?.settling ? 'is-settling' : ''}`}
            style={{ flexGrow: weight(s), '--f': info.theme.field, '--i': info.theme.ink, transform: shift(i) } as CSSProperties}
            onPointerDown={(e) => down(e, i)}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={cancel}
          >
            {onSelect ? (
              <button
                className="jr-block"
                onClick={() => {
                  if (swallowClick.current) {
                    swallowClick.current = false
                    return
                  }
                  onSelect(i)
                }}
                onKeyDown={(e) => keys(e, i)}
                aria-pressed={selected === i}
                aria-label={`${i + 1}. ${info.title}, ${s.on ? info.detail : 'off'}. Edit${onReorder ? '. Alt and arrow keys to move' : ''}`}
              >
                {inner}
              </button>
            ) : (
              <div className="jr-block">{inner}</div>
            )}
          </li>
        )
      })}
      {onAdd && (
        <li className="jr-step is-add">
          <button className="jr-block" onClick={onAdd} aria-expanded={adding} aria-label="Add a step">
            <Icon name="plus" size={22} />
            <span className="jr-title">Add</span>
          </button>
        </li>
      )}
    </ol>
  )
}
