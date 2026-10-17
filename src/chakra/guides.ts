/**
 * Teaching content for each chakra's guide window.
 *
 * Sources (kept local in research/sources/raw):
 * - shrimataji.org (Shri Mataji Foundation): chakra pages, "A Pivotal Moment"
 * - Official Sahaja Yoga USA chakra guides and practice handouts (us.sahajayoga.org/handouts)
 * - The Sahaja Yoga USA free 21-day course: each day's teaching and quoted words of Shri Mataji
 *
 * Wording stays non-medical. Items marked `verify` are traditional practice wording
 * to confirm with the Sahaja Yoga collective before launch.
 */

export type Side = 'left' | 'right' | 'centre' | 'all'

export type Remedy = {
  id: string
  title: string
  /** Which side or channel it works on. */
  side?: Side
  /** Minutes for the guided timer; omit for a step-only practice. */
  minutes?: number
  when?: string
  steps: string[]
}

export type HandPoint = 'heel' | 'thumb' | 'index' | 'middle' | 'ring' | 'little' | 'centre'

export type Quote = { text: string; source: string }

export type Affirmation = { text: string; position: string; times: number; note?: string; verify?: boolean }

export type Guide = {
  meaning?: string
  overview: string[]
  petals: { count: number; label: string; items?: string[]; text?: string }
  qualities: { name: string; text: string }[]
  facts: { where: string; element: string; colour: string; felt: string }
  sides: { side: Side; title: string; text: string }[]
  disturbs: string[]
  signs: string[]
  grows: string[]
  story?: { title: string; date: string; paragraphs: string[]; quote: Quote }
  quotes: Quote[]
  remedies: Remedy[]
  affirmations: Affirmation[]
  feel: { point: HandPoint; text: string }
}

const COURSE = 'Shri Mataji, quoted in the Sahaja Yoga 21-day course'
const FOUNDATION = 'Shri Mataji, shrimataji.org'

/** Before any meditation, for every chakra. */
export const PREPARE: Remedy[] = [
  {
    id: 'raise',
    title: 'Raise your Kundalini',
    side: 'centre',
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
    side: 'all',
    steps: [
      'Left palm open on your lap.',
      'Right hand, palm facing you, rises from the left hip over your head and down to the right hip.',
      'Then back the same way. That arc is one.',
      'Do it seven times, keeping the hand a few centimetres from the body.',
    ],
  },
]

/** The daily rhythm the course recommends, shown under every chakra. */
export const DAILY: { time: string; text: string }[] = [
  { time: 'Morning', text: 'Raise your Kundalini, put on a bandhan, meditate in silence.' },
  { time: 'Leaving home', text: 'A bandhan before you go out.' },
  { time: 'Evening', text: 'Foot soak in salt water, then meditate before sleep.' },
]

export const GUIDES: Record<string, Guide> = {
  mooladhara: {
    meaning: 'Moola, root · adhara, support: the support of the root of creation',
    overview: [
      'The first chakra, and the foundation of the whole subtle system. It sits below the sacrum, where the Kundalini rests, and supports her. Its qualities are eternal and indestructible: they manifest fully once the Kundalini is awakened.',
      'We come into the world as innocent babies, so the childlike quality is innate in us. Innocence, spontaneity and wisdom are how this centre shows itself. As it grows through meditation, there is a deep sense of innocence, respect and love for ourselves and for others, and the personality becomes magnetic.',
    ],
    petals: {
      count: 4,
      label: 'Four petals',
      items: ['Joy', 'Confidence in the Divinity within us', 'Truth', 'Righteousness'],
    },
    qualities: [
      { name: 'Innocence', text: 'Eternal. It can be clouded by our mistakes, never destroyed; with Realization it is re-established.' },
      { name: 'Wisdom', text: 'The innate ability to tell right from wrong, and to avoid what harms ourselves or others.' },
      { name: 'Purity', text: 'An attention free of lust and greed: what the awakened Kundalini gives back to us.' },
      { name: 'Childlike joy', text: 'Living in the moment, with a child’s simple, untainted dignity.' },
      { name: 'Direction and balance', text: 'A sense of purpose, a good memory and a steady sense of gravity.' },
      { name: 'Harmony with nature', text: 'Made of the earth element, it connects our awareness to Mother Earth and her bounties.' },
    ],
    facts: {
      where: 'Pelvic plexus, at the base of the spine, below the sacrum',
      element: 'Earth',
      colour: 'Coral red',
      felt: 'Base of the palm',
    },
    sides: [
      { side: 'left', title: 'Left side', text: 'Linked to the left channel of emotion and the past. Balancing it guards against lethargy and heaviness of mood. Sitting on the earth clears the left Mooladhara.' },
      { side: 'centre', title: 'Centre', text: 'Innocence and wisdom themselves: the support on which the Kundalini rests and from which she rises.' },
      { side: 'right', title: 'Right side', text: 'Linked to the right channel of action and the future. Balance here eases aggressiveness, excessive thinking and planning, and over-indulgence.' },
    ],
    disturbs: [
      'An overload of mental activity',
      'Excessive indulgence in the pleasures of the senses',
      'Negative social influences that cover our innocence',
    ],
    signs: ['A poor sense of direction', 'A poor memory', 'A poor sense of balance, of gravity'],
    grows: [
      'Inner wisdom: seeing quickly what is right',
      'Better memory, attention and focus',
      'Seeing people and situations without prejudice',
      'Harmony with nature, and a magnetic personality',
    ],
    quotes: [
      {
        text: 'This innocence never gets destroyed because it is eternal, but it may happen that it will get covered with some clouds by our mistakes that we commit. But once you get your Realization, your innocence is re-established, manifests, and you become innocent.',
        source: COURSE,
      },
      {
        text: 'An innocent person is really like a magnet and it attracts, he attracts, the people towards himself, just like a flower attracts a bee towards itself.',
        source: COURSE,
      },
      { text: 'You have to have complete faith in yourself and that your Self is nothing but innocence.', source: COURSE },
      {
        text: 'The lowest center is for our innocence. Our innocence can never be destroyed because it is eternal. Only it can be covered with some clouds. But with the awakening of the Kundalini the innocence comes back to us.',
        source: FOUNDATION,
      },
    ],
    remedies: [
      {
        id: 'earth',
        title: 'Sit on the earth',
        side: 'left',
        minutes: 5,
        when: 'Outdoors, as often as you can',
        steps: [
          'Sit cross-legged directly on the ground: grass, soil or sand.',
          'Place both hands on the earth beside your hips, palms facing down.',
          'Ask Mother Earth to absorb what is not needed.',
          'Rest your attention on the top of your head, in silence.',
        ],
      },
      {
        id: 'petals',
        title: 'Meditate on the four petals',
        side: 'centre',
        minutes: 4,
        when: 'A minute on each quality',
        steps: [
          'Joy: let the simple joy of a child rise in you.',
          'Confidence in the Divinity within you.',
          'Truth: rest in what is true, without thinking about it.',
          'Righteousness: a quiet, steady sense of what is right.',
        ],
      },
      {
        id: 'footsoak',
        title: 'Salt water foot soak',
        side: 'all',
        minutes: 10,
        when: 'Evenings, before sleep',
        steps: [
          'A bowl of lukewarm water to the ankles, with a handful of salt.',
          'Sit on a chair, a candle in front of you, palms open on your lap.',
          'Raise your Kundalini and put on a bandhan.',
          'Feet in the water. Ask: “Mother Kundalini, please absorb all the imbalance from my chakras and channels into the salt water.”',
          'Sit in silence, eyes open. Afterwards rinse your feet, flush the water away and meditate.',
        ],
      },
    ],
    affirmations: [
      {
        text: 'Mother, You are the innocence within me.',
        position: 'Right hand on the base of the spine, or palms down on the earth',
        times: 4,
        note: 'Four, for the four petals.',
        verify: true,
      },
    ],
    feel: {
      point: 'heel',
      text: 'Felt at the base of the palm, just above the wrist. A tingle, heat or heaviness there points to this chakra. The left hand speaks for the left side, the right hand for the right, both hands for the centre.',
    },
  },

  sahasrara: {
    meaning: 'Sahasra, a thousand: the thousand-petalled lotus',
    overview: [
      'The seventh centre, at the top of the head, in the limbic area of the brain. It symbolises the culmination of our evolution. Here the Kundalini pierces the Brahmarandra, the opening at the crown, and our individual consciousness unites with the all-pervading power.',
      'It integrates the whole subtle system: each of the six chakras below has its seat here, the way the brain receives and coordinates the whole nervous system. Through it we perceive reality directly, beyond thought, and come to a state of doubtless awareness.',
    ],
    petals: {
      count: 1000,
      label: 'A thousand petals',
      text: 'A thousand nerves surround the hollow space of the limbic area. When the Kundalini enters, they fire together and the lotus opens.',
    },
    qualities: [
      { name: 'Integration', text: 'Oneness with all the elements of the universe; the qualities of every chakra brought together.' },
      { name: 'Thoughtless awareness', text: 'Nirvichara: fully alert, with no unwanted thoughts, living in the present.' },
      { name: 'Doubtless awareness', text: 'Nirvikalpa: no longer belief on faith alone, but a felt certainty of the divine.' },
      { name: 'Collective attention', text: 'The individual attention joins the collective, Divine attention.' },
      { name: 'Inner joy', text: 'A joy without duality, no longer consumed by the past or the future.' },
    ],
    facts: {
      where: 'The limbic area of the brain, opening at the fontanel',
      element: 'All elements, integrated',
      colour: 'All colours, a rainbow lotus',
      felt: 'Centre of the palm, and above the head',
    },
    sides: [
      { side: 'left', title: 'Left, the past', text: 'The superego: memories, habits and conditioning. When it swells like a balloon, it presses on the gate to the Sahasrara.' },
      { side: 'centre', title: 'The narrow gate', text: 'The Agnya, at the forehead, is the gateway. As it clears, both balloons shrink and the Kundalini passes into the Sahasrara: thinking stops, you simply watch.' },
      { side: 'right', title: 'Right, the future', text: 'The ego: thinking, planning, doing. Over-activity inflates it and keeps the attention below the crown.' },
    ],
    disturbs: ['Self-doubt', 'Extreme atheism', 'Going to extremes'],
    signs: ['Difficulty feeling the cool breeze', 'Doubts about spiritual reality', 'A busy, restless mind'],
    grows: [
      'Calm, without confusion or contradiction',
      'Knowing intuitively what is right',
      'Perceiving truth directly',
      'Joy that does not depend on circumstances',
    ],
    story: {
      title: 'The opening of the Sahasrara',
      date: '5 May 1970 · Nargol, India',
      paragraphs: [
        'On the west coast of India, near Mumbai, Shri Mataji opened the Sahasrara in meditation. She described the Kundalini rising “like a telescope”, opening one chakra after another, the colour of molten, red-hot iron, until it pierced the Brahmarandra.',
        'From that day, self-realization no longer belonged to a few seekers after years of effort. It could be given en masse, freely, to anyone who desired it. Sahaja Yogis celebrate the date every year as Sahasrara Day.',
      ],
      quote: {
        text: 'I felt at that moment whatever energy was there above suddenly entered within me like a cool breeze from every direction. I saw the whole thing open and a big torrential rain of breeze started flowing through my head all over.',
        source: FOUNDATION,
      },
    },
    quotes: [
      {
        text: 'As soon as the Kundalini enters into the limbic area, she soothes it and it opens, like a lotus, thousand-petalled lotus. It opens and then the Kundalini emerges out of your fontanelle bone area and gets connected to the all-pervading power.',
        source: COURSE,
      },
      { text: 'Unless and until your Sahasrara is open, all the blessings of the Divine Power cannot come to you.', source: COURSE },
      {
        text: 'Sahaja Yoga is like building first the pinnacle of the building, and then the foundation. Opening your Sahasrara was the first thing that was achieved. And then in the light of Sahasrara you have to watch yourself and see for yourself.',
        source: COURSE,
      },
      { text: 'Meditation is the only way you can grow. Because when you meditate, you are in silence.', source: COURSE },
    ],
    remedies: [
      {
        id: 'crown',
        title: 'Open the crown',
        side: 'centre',
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
        id: 'offer',
        title: 'Offer your worries to the silence',
        side: 'all',
        minutes: 5,
        when: 'When the mind is busy',
        steps: [
          'Raise your Kundalini and bring your attention to the top of your head.',
          'One by one, offer your worries, opinions and frustrations to the silence above your head.',
          'Let your attention join the vast, Divine attention there.',
          'Stay in that silence; if a thought comes, offer it up too.',
        ],
      },
      {
        id: 'silence',
        title: 'Sit in thoughtless awareness',
        side: 'centre',
        minutes: 10,
        when: 'Daily',
        steps: [
          'Palms open on your lap, eyes closed.',
          'Desire the state of silence; that desire is the first technique.',
          'Watch, without getting involved in what you watch.',
          'At the end, hold a hand above your head and feel for the breeze.',
        ],
      },
    ],
    affirmations: [
      {
        text: 'Let me experience the state of meditation.',
        position: 'Right palm on the crown, rotating clockwise',
        times: 7,
      },
      {
        text: 'Mother, please give me my self-realization.',
        position: 'Right palm on the fontanel, pressing the scalp, rotating clockwise',
        times: 7,
        note: 'The last step of the self-realization exercise.',
        verify: true,
      },
    ],
    feel: {
      point: 'centre',
      text: 'Felt in the centre of the palm, and as a cool breeze above the head. At first it may feel warm, as the Kundalini purifies; it cools with practice. Hold a hand a few centimetres above the fontanel, left then right, to feel it.',
    },
  },
}
