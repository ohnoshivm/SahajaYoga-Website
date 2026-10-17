import type { ReactNode } from 'react'
import { CHAKRAS, MOOLADHARA } from '../../chakra/chakras'
import { MeditationScreen } from '../../screen/MeditationScreen'
import type { StepProps } from './common'

export const lapsKey = (slug: string) => `sadhana-${slug}`

/** The mantra screen itself, counting toward this step's rounds. */
export function LapsStep({ chakra: slug, rounds, onDone, onProgress, header }: StepProps & { chakra: string; rounds: number; header: ReactNode }) {
  const chakra = CHAKRAS[slug] ?? MOOLADHARA
  return (
    <MeditationScreen
      chakra={chakra}
      embedded={{ sessionKey: lapsKey(chakra.slug), headerLeft: header, rounds, onDone, onProgress }}
    />
  )
}
