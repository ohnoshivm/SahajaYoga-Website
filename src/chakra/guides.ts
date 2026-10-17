/**
 * Teaching content for each chakra's guide window.
 * Source: the official Sahaja Yoga USA chakra guides and practice handouts
 * (us.sahajayoga.org/handouts), summarised in research/data/subtle-system.json.
 * Wording is kept non-medical. Items marked `verify` are traditional practice
 * wording to confirm with the Sahaja Yoga collective before launch.
 */

export type Remedy = {
  id: string
  title: string
  /** Minutes for the guided timer; omit for a step-only practice. */
  minutes?: number
  when?: string
  steps: string[]
}

export type HandPoint = 'heel' | 'thumb' | 'index' | 'middle' | 'ring' | 'little' | 'centre'

export type Guide = {
  meaning?: string
  intro: string
  qualities: string[]
  where: string
  element: string
  colour: string
  feel: { point: HandPoint; text: string }
  signs: string[]
  remedies: Remedy[]
  affirmation: { text: string; position: string; times: number; verify?: boolean }
}

/** Before any meditation, for every chakra. */
export const PREPARE: Remedy[] = [
  {
    id: 'raise',
    title: 'Raise your Kundalini',
    steps: [
      'Sit comfortably, attention on the top of your head.',
      'Left hand in front of your lower abdomen, palm facing you.',
      'Raise it up the front of your body while the right hand circles it clockwise.',
      'Above your head, tie a knot. Repeat three times: one knot, then two, then three.',
    ],
  },
  {
    id: 'bandhan',
    title: 'Put on a bandhan',
    steps: [
      'Left palm open on your lap.',
      'Right hand, palm facing you, rises from the left hip over your head and down to the right hip.',
      'Then back the same way. That arc is one.',
      'Do it seven times, keeping the hand a few centimetres from the body.',
    ],
  },
]

export const GUIDES: Record<string, Guide> = {
  mooladhara: {
    meaning: 'Moola, root · adhara, support',
    intro:
      'The foundation of the whole subtle system. Its qualities are eternal: they can be covered, like the sun by clouds, but never destroyed. When the Kundalini nourishes it, the innocence of a child returns.',
    qualities: [
      'Innocence', 'Wisdom', 'Purity', 'Simplicity', 'Childlike joy',
      'Dignity', 'Balance', 'Purpose and direction', 'Harmony with nature',
    ],
    where: 'Pelvic plexus, at the base of the spine',
    element: 'Earth',
    colour: 'Coral red',
    feel: {
      point: 'heel',
      text: 'Felt at the base of the palm, just above the wrist. Left hand for the left side, right hand for the right, both for the centre.',
    },
    signs: ['A poor sense of direction', 'A poor memory', 'Feeling ungrounded or off balance'],
    remedies: [
      {
        id: 'earth',
        title: 'Sit on the earth',
        minutes: 5,
        when: 'Any time outdoors',
        steps: [
          'Sit cross-legged directly on the ground: grass, soil or sand.',
          'Place both hands on the earth beside your hips, palms facing down.',
          'Ask Mother Earth to absorb what is not needed.',
          'Rest your attention on the top of your head, in silence.',
        ],
      },
      {
        id: 'footsoak',
        title: 'Salt water foot soak',
        minutes: 10,
        when: 'Evenings, before sleep',
        steps: [
          'A bowl of warm water to the ankles, with a handful of salt.',
          'Sit on a chair, a candle in front of you, palms open on your lap.',
          'Raise your Kundalini and put on a bandhan.',
          'Feet in the water. Ask: “Mother Kundalini, please absorb all the imbalance from my chakras into the salt water.”',
          'Sit in silence, eyes open. Afterwards rinse your feet and flush the water away.',
        ],
      },
    ],
    affirmation: {
      text: 'Mother, You are the innocence within me.',
      position: 'Right hand on the base of the spine, or palms down on the earth',
      times: 4,
      verify: true,
    },
  },

  sahasrara: {
    meaning: 'The thousand-petalled lotus',
    intro:
      'Where the Kundalini emerges at the top of the head and unites with the all-pervading power. Each of the six chakras below has its seat here. It is the place of integration, where you experience thoughtless awareness, and later, doubtless awareness.',
    qualities: ['Integration', 'Thoughtless awareness', 'Doubtless awareness', 'Oneness', 'Inner joy'],
    where: 'The limbic area of the brain, opening at the fontanel',
    element: 'All elements, integrated',
    colour: 'All colours, a rainbow lotus',
    feel: {
      point: 'centre',
      text: 'Felt in the centre of the palm, and as a cool breeze above the head. Hold a hand a few centimetres over the fontanel to feel it.',
    },
    signs: ['Difficulty feeling the cool breeze', 'Doubts about the spiritual experience', 'A busy, restless mind'],
    remedies: [
      {
        id: 'crown',
        title: 'Open the crown',
        minutes: 3,
        when: 'At the start or end of meditation',
        steps: [
          'Place the centre of your right palm firmly on the top of your head.',
          'Push the fingers back slightly and press the scalp.',
          'Rotate slowly clockwise, seven times, with the affirmation.',
          'Then rest, and feel for the breeze above your head.',
        ],
      },
      {
        id: 'silence',
        title: 'Sit in silence',
        minutes: 10,
        when: 'Daily',
        steps: [
          'Palms open on your lap, eyes closed.',
          'Bring your attention to the top of your head.',
          'Desire the state of silence; let thoughts rise and fall away.',
          'At the end, hold a hand above your head and feel for the breeze.',
        ],
      },
    ],
    affirmation: {
      text: 'Let me experience the state of meditation.',
      position: 'Right palm on the crown, rotating clockwise',
      times: 7,
    },
  },
}
