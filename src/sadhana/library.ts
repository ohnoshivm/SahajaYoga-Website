import { CHAKRAS, MOOLADHARA, SAHASRARA, type ChakraTheme } from '../chakra/chakras'
import { GUIDES, PREPARE, type Remedy } from '../chakra/guides'
import { CHANTS } from './chants'
import type { Feeling, Sitting, Step } from './types'

// ── Fields: one bold colour per screen ────────────────

export const INK: ChakraTheme = {
  field: '#15120E',
  ink: '#F5F2EC',
  inkSoft: 'rgba(245, 242, 236, 0.62)',
  glow: '#E4D4FF',
  light: SAHASRARA.theme.light,
}

export const FIELDS = { white: SAHASRARA.theme, coral: MOOLADHARA.theme, ink: INK }
export type FieldId = keyof typeof FIELDS

// ── Practices ─────────────────────────────────────────

export type Practice = Remedy & { source: string; field: FieldId }

const USA = 'Sahaja Yoga USA'

/** Clearing practices for sittings, from the official handouts (research/sources/raw/us-handouts-pdf). */
const SITTING_REMEDIES: Practice[] = [
  {
    id: 'balance',
    title: 'Balance left and right',
    side: 'all',
    minutes: 6,
    when: 'Two or three minutes for each side',
    field: 'white',
    source: `${USA}, Balancing the left and right channels`,
    steps: [
      'Sit with your back straight, both hands palms up on your lap. Close your eyes and slow your breathing.',
      'Left side: point your right hand down towards the earth, or rest it on the ground. Left hand open on your lap.',
      'Ask silently, from your heart: “Inner Energy, please remove all the imbalances of my left side into the mother earth.”',
      'Right side: right hand open on your lap. Raise your left hand beside your shoulder, palm facing back.',
      'Ask silently: “Inner Energy, please remove all the imbalances of my right side into the ether.”',
      'Both hands on your lap, palms up. Ask two or three times: “Inner Energy, please grant me the state of meditation.”',
    ],
  },
  {
    id: 'ice',
    title: 'Cool the right side with ice',
    side: 'right',
    minutes: 9,
    when: 'Not straight before or after eating',
    field: 'white',
    source: `${USA}, How to use the ice treatment`,
    steps: [
      'Too much thinking, planning and doing stores heat in the liver. It makes us irritable and keeps thoughtless awareness away.',
      'Press an ice pack to your right side, over the liver, just below the rib cage.',
      'Keep it there and meditate, your attention on the top of your head.',
      'Let the heat go. Eight to ten minutes is enough.',
    ],
  },
  {
    id: 'candle',
    title: 'Clear the left side with a candle',
    side: 'left',
    minutes: 5,
    when: 'Safety first: no loose clothing, nothing nearby that could catch fire',
    field: 'coral',
    source: `${USA}, 21-day course and the Swadisthan guide`,
    steps: [
      'Light a small candle in a holder. Sit on a chair or on the floor, left hand open on your lap.',
      'Hold the candle in your right hand, a few centimetres in front of your left Swadisthan, just above where the torso meets the left leg.',
      'Move the flame slowly clockwise in front of the chakra. Let the light clear what weighs on the left side.',
      'Rise slowly up the left side, then set the candle down and sit in silence.',
    ],
  },
]

const FOOTSOAK = GUIDES.mooladhara.remedies.find((r) => r.id === 'footsoak')!

export const PRACTICES: Record<string, Practice> = Object.fromEntries(
  [
    ...SITTING_REMEDIES,
    { ...FOOTSOAK, title: 'Foot soak', field: 'ink' as FieldId, source: `${USA}, How to practise foot soaking` },
    ...GUIDES.mooladhara.remedies.filter((r) => r.id !== 'footsoak').map((r) => ({ ...r, field: 'coral' as FieldId, source: 'Mooladhara guide' })),
    ...GUIDES.sahasrara.remedies.map((r) => ({ ...r, field: 'white' as FieldId, source: 'Sahasrara guide' })),
  ].map((p) => [p.id, p]),
)

/** Counted tasks for the opening and the close. */
export const RAISE = { ...PREPARE.find((r) => r.id === 'raise')!, times: 3 }
export const BANDHAN = { ...PREPARE.find((r) => r.id === 'bandhan')!, times: 7 }

// ── What each step is called, how long it takes, and its colour ──

export type StepInfo = { title: string; detail: string; minutes: number; theme: ChakraTheme; category: string }

export function stepInfo(step: Step): StepInfo {
  switch (step.kind) {
    case 'prepare':
      return { category: 'Begin', title: 'Prepare', detail: 'Raise the Kundalini · bandhan', minutes: 2, theme: FIELDS.white }
    case 'chant': {
      const c = CHANTS[step.chant]
      const mins = (c.duration * step.repeats) / 60
      return {
        category: 'Mantra',
        title: c.title,
        detail: `${step.mode === 'follow' ? 'With the recording' : 'Recite'}${step.repeats > 1 ? ` · ×${step.repeats}` : ''}`,
        minutes: Math.max(1, Math.round(mins)),
        theme: FIELDS[c.field],
      }
    }
    case 'silence': {
      const ch = CHAKRAS[step.chakra] ?? SAHASRARA
      return { category: 'Meditation', title: 'Silence', detail: `${ch.name} · ${step.minutes} min`, minutes: step.minutes, theme: ch.theme }
    }
    case 'laps': {
      const ch = CHAKRAS[step.chakra] ?? MOOLADHARA
      return {
        category: 'Mantra meditation',
        title: `${ch.name} laps`,
        detail: `${step.rounds} ${step.rounds === 1 ? 'round' : 'rounds'} of ten`,
        minutes: step.rounds * 4,
        theme: ch.theme,
      }
    }
    case 'talk':
      return { category: 'Shri Mataji', title: 'The talk', detail: 'From your link', minutes: 0, theme: INK }
    case 'remedy': {
      const p = PRACTICES[step.remedy]
      const minutes = step.minutes ?? p?.minutes ?? 5
      return { category: 'Clearing', title: p?.title ?? step.remedy, detail: `${minutes} min`, minutes, theme: FIELDS[p?.field ?? 'white'] }
    }
    case 'affirm': {
      const ch = CHAKRAS[step.chakra] ?? MOOLADHARA
      return { category: 'Affirmations', title: ch.name, detail: ch.quality, minutes: 3, theme: ch.theme }
    }
    case 'close':
      return { category: 'Close', title: 'Thank You, Mother', detail: 'Bandhan', minutes: 1, theme: FIELDS.white }
  }
}

// ── Ready-made sittings ───────────────────────────────

const teen: Step = { kind: 'chant', on: true, chant: 'teen-mahamantra', repeats: 1, mode: 'follow' }
const atharva: Step = { kind: 'chant', on: true, chant: 'atharvashirsha', repeats: 1, mode: 'follow' }

export const PRESETS: Sitting[] = [
  {
    id: 'morning',
    name: 'Morning',
    note: 'Short and steady, before the day',
    steps: [
      { kind: 'prepare', on: true },
      teen,
      { kind: 'silence', on: true, chakra: 'sahasrara', minutes: 8 },
      { kind: 'affirm', on: false, chakra: 'sahasrara' },
      { kind: 'close', on: true },
    ],
  },
  {
    id: 'evening',
    name: 'Evening',
    note: 'Clear the day, then go deep',
    steps: [
      { kind: 'prepare', on: true },
      { kind: 'remedy', on: true, remedy: 'footsoak' },
      teen,
      atharva,
      { kind: 'silence', on: true, chakra: 'sahasrara', minutes: 7 },
      { kind: 'laps', on: true, chakra: 'mooladhara', rounds: 1 },
      { kind: 'talk', on: false },
      { kind: 'close', on: true },
    ],
  },
  {
    id: 'full',
    name: 'Full',
    note: 'Everything, in order',
    steps: [
      { kind: 'prepare', on: true },
      { kind: 'remedy', on: true, remedy: 'balance' },
      { kind: 'remedy', on: true, remedy: 'footsoak' },
      teen,
      atharva,
      { kind: 'silence', on: true, chakra: 'sahasrara', minutes: 10 },
      { kind: 'laps', on: true, chakra: 'mooladhara', rounds: 2 },
      { kind: 'talk', on: true },
      { kind: 'affirm', on: true, chakra: 'mooladhara' },
      { kind: 'close', on: true },
    ],
  },
  {
    id: 'clear',
    name: 'Quick clearing',
    note: 'When you feel heavy',
    steps: [
      { kind: 'prepare', on: true },
      { kind: 'remedy', on: true, remedy: 'balance' },
      { kind: 'silence', on: true, chakra: 'sahasrara', minutes: 5 },
      { kind: 'close', on: true },
    ],
  },
]

/** Pieces that can be added to any sitting. */
export const ADDABLE: { label: string; group: string; step: Step }[] = [
  { group: 'Mantras', label: CHANTS['teen-mahamantra'].title, step: teen },
  { group: 'Mantras', label: CHANTS.atharvashirsha.title, step: atharva },
  { group: 'Meditation', label: 'Silence · Sahasrara', step: { kind: 'silence', on: true, chakra: 'sahasrara', minutes: 7 } },
  { group: 'Meditation', label: 'Silence · Mooladhara', step: { kind: 'silence', on: true, chakra: 'mooladhara', minutes: 7 } },
  { group: 'Meditation', label: 'Mooladhara laps', step: { kind: 'laps', on: true, chakra: 'mooladhara', rounds: 1 } },
  { group: 'Meditation', label: 'Sahasrara laps', step: { kind: 'laps', on: true, chakra: 'sahasrara', rounds: 1 } },
  { group: 'Meditation', label: 'Shri Mataji talk', step: { kind: 'talk', on: true } },
  ...Object.values(PRACTICES).map((p) => ({ group: 'Clearing', label: p.title, step: { kind: 'remedy', on: true, remedy: p.id } as Step })),
  { group: 'Affirmations', label: 'Mooladhara affirmations', step: { kind: 'affirm', on: true, chakra: 'mooladhara' } },
  { group: 'Affirmations', label: 'Sahasrara affirmations', step: { kind: 'affirm', on: true, chakra: 'sahasrara' } },
]

/**
 * The steps that actually run: switched-on ones, the talk only with a link, and the
 * check-in's clearing added after the opening (candle for a heavy left, ice for a heavy right).
 */
export function plan(sitting: Sitting, feeling: Feeling, hasTalk: boolean): Step[] {
  // One talk per sitting: there is one link and one preloaded player.
  const firstTalk = sitting.steps.findIndex((s) => s.kind === 'talk' && s.on)
  const steps = sitting.steps.filter((s, i) => s.on && (s.kind !== 'talk' || (hasTalk && i === firstTalk)))
  if (feeling === 'balanced') return steps
  const remedy = feeling === 'left' ? 'candle' : 'ice'
  if (steps.some((s) => s.kind === 'remedy' && s.remedy === remedy)) return steps
  const after = steps.findIndex((s) => s.kind === 'prepare')
  const at = after + 1
  return [...steps.slice(0, at), { kind: 'remedy', on: true, remedy }, ...steps.slice(at)]
}

export function totalMinutes(steps: Step[]): number {
  return steps.reduce((sum, s) => sum + (s.on ? stepInfo(s).minutes : 0), 0)
}
