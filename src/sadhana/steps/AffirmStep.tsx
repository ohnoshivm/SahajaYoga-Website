import { useMemo, useState } from 'react'
import { CHAKRAS, MOOLADHARA } from '../../chakra/chakras'
import { GUIDES, type Side } from '../../chakra/guides'
import { haptic, isControl, useDelay, useRipples, useSpace, type StepProps } from './common'
import { Ripples } from './Ripples'

const SIDE: Partial<Record<Side, string>> = { centre: 'Centre', left: 'Left side', right: 'Right side' }

/** The chakra's affirmations for today's side (centre when balanced), one at a time, counted. */
export function AffirmStep({ chakra: slug, active, paused, feeling, onDone, onProgress }: StepProps & { chakra: string }) {
  const chakra = CHAKRAS[slug] ?? MOOLADHARA
  const list = useMemo(() => {
    const all = GUIDES[chakra.slug]?.affirmations ?? []
    const side: Side = feeling === 'balanced' ? 'centre' : feeling
    const picked = all.filter((a) => a.side === side)
    return picked.length ? picked : all.filter((a) => a.side === 'centre')
  }, [chakra.slug, feeling])

  const [i, setI] = useState(0)
  const [count, setCount] = useState(0)
  const [finished, setFinished] = useState(false)
  const [ripples, spawn] = useRipples()
  const delay = useDelay()
  const a = list[Math.min(i, list.length - 1)]
  const live = active && !paused && !finished && !!a

  const say = () => {
    if (!live || count >= a.times) return
    const next = count + 1
    setCount(next)
    onProgress((i + next / a.times) / list.length)
    haptic(next < a.times ? 8 : [16, 60, 16])
    if (next < a.times) return
    if (i + 1 < list.length) {
      delay(() => {
        setI(i + 1)
        setCount(0)
      }, 1100)
    } else {
      setFinished(true)
      onDone()
    }
  }
  useSpace(live, say)

  if (!a) return null
  return (
    <section
      className="st st-affirm"
      onPointerDown={(e) => live && !isControl(e) && spawn(e)}
      onPointerUp={(e) => !isControl(e) && say()}
    >
      <blockquote className="st-quote" key={i}>“{a.text}”</blockquote>
      {a.position && <p className="st-position">{a.position}</p>}
      <div className="st-dots" aria-label={`${count} of ${a.times}`}>
        {Array.from({ length: a.times }, (_, k) => <i key={k} className={k < count ? 'is-on' : ''} />)}
      </div>
      <p className="st-foot">Say it from the heart, then tap or press Space</p>
      <p className="st-source">
        {chakra.name} · {SIDE[a.side] ?? a.side} · {i + 1} of {list.length} · {a.source}
      </p>
      <Ripples ripples={ripples} />
    </section>
  )
}
