/**
 * A sitting is an ordered list of steps. Each step is a piece from the library plus the
 * rule for when it ends. The frame stays fixed; what goes into it is editable.
 */

export type ChantMode = 'follow' | 'recite'

export type Step =
  /** Raise the Kundalini (×3) and put on a bandhan (×7). Ends when both are counted. */
  | { kind: 'prepare'; on: boolean }
  /** A recorded mantra with its text. Ends after the recording plays `repeats` times. */
  | { kind: 'chant'; on: boolean; chant: string; repeats: number; mode: ChantMode }
  /** The 3D chakra and a timer, nothing else. */
  | { kind: 'silence'; on: boolean; chakra: string; minutes: number }
  /** The mantra screen: ten laps make a round. */
  | { kind: 'laps'; on: boolean; chakra: string; rounds: number }
  /** A Shri Mataji talk from the link given on the start screen, preloaded. */
  | { kind: 'talk'; on: boolean }
  /** A guided practice with a timer: foot soak, balancing, ice, candle… */
  | { kind: 'remedy'; on: boolean; remedy: string; minutes?: number }
  /** The chakra's affirmations, counted. */
  | { kind: 'affirm'; on: boolean; chakra: string }
  /** A bandhan and thanks. */
  | { kind: 'close'; on: boolean }

export type StepKind = Step['kind']

export type Sitting = {
  id: string
  name: string
  note: string
  steps: Step[]
}

/** How the body feels before starting; adds the matching clearing. */
export type Feeling = 'balanced' | 'left' | 'right'

export type Talk = {
  url: string
  id: string
  /** Seconds. */
  start: number
  end?: number
  title?: string
}

// ── Chants ────────────────────────────────────────────

export type Gloss = { w: string; m: string }

export type ChantLine = {
  /** Seconds into the recording where the line is heard; omitted past the recording's end. */
  at?: number
  deva: string
  roman: string
  meaning: string
  /** Word-by-word meanings for the transliteration, in order. */
  words?: Gloss[]
}

export type ChantVerse = { title?: string; lines: ChantLine[] }

export type Chant = {
  id: string
  title: string
  script: string
  about: string
  audio: string
  /** Seconds. */
  duration: number
  verses: ChantVerse[]
  field: 'white' | 'coral' | 'ink'
  credit: string
  textNote?: string
}
