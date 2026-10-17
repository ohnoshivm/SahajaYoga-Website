import { useEffect, useRef, useState } from 'react'
import { CHAKRAS, SAHASRARA } from '../../chakra/chakras'
import { ChakraStage } from '../../chakra/ChakraStage'
import { formatTime } from '../../engine/session'
import { useReducedMotion } from '../../screen/MeditationScreen'
import { useCountdown, type StepProps } from './common'

/** After this long without movement the timer steps back, so nothing pulls at the attention. */
const QUIET_MS = 8000

/** The 3D chakra, a quiet timer, nothing else. */
export function SilenceStep({ chakra: slug, minutes, active, paused, onDone, onProgress }: StepProps & { chakra: string; minutes: number }) {
  const chakra = CHAKRAS[slug] ?? SAHASRARA
  const reduced = useReducedMotion()
  const pulse = useRef(0)
  const bloom = useRef(0)
  const pointer = useRef<[number, number]>([0, 0])
  const [complete, setComplete] = useState(false)
  const [quiet, setQuiet] = useState(false)
  const quietId = useRef(0)

  const wake = () => {
    setQuiet(false)
    clearTimeout(quietId.current)
    quietId.current = window.setTimeout(() => setQuiet(true), QUIET_MS)
  }
  useEffect(() => {
    wake()
    return () => clearTimeout(quietId.current)
  }, [])

  useEffect(() => {
    if (!active) return
    pulse.current = 1
  }, [active])

  const total = minutes * 60_000
  const left = useCountdown(total, active && !paused, () => {
    setComplete(true)
    bloom.current = 1
    onDone()
  })
  const progress = 1 - left / total
  useEffect(() => onProgress(progress), [progress, onProgress])

  return (
    <section
      className={`st st-silence ${quiet && !complete ? 'is-quiet' : ''}`}
      onPointerMove={(e) => {
        pointer.current = [(e.clientX / innerWidth) * 2 - 1, (e.clientY / innerHeight) * 2 - 1]
        if (quiet) wake()
      }}
      onPointerDown={wake}
    >
      <div className="st-stage" aria-hidden="true">
        <ChakraStage chakra={chakra} pulse={pulse} bloom={bloom} pointer={pointer} still={reduced} scale={0.82} />
      </div>
      <p className="st-whisper">
        {complete ? 'Hold a hand above your head and feel for the cool breeze.' : 'Attention on the top of your head. Watch, without thinking.'}
      </p>
      <p className="st-silence-time" aria-label={`${formatTime(left)} left`}>{formatTime(left)}</p>
    </section>
  )
}
