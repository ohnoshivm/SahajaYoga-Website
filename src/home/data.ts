/**
 * The subtle-system journey: what each chapter says and where it lives in the figure.
 * Content from research/data/subtle-system.json (Sahaja Yoga USA chakra guides and
 * shrimataji.org). World units: the seated figure is ~1.4 tall, facing +z; the person's
 * left side is +x.
 */

export type CentreId = 'mooladhara' | 'swadisthan' | 'nabhi' | 'void' | 'anahat' | 'vishuddhi' | 'agnya' | 'sahasrara'

export type Centre = {
  id: CentreId
  name: string
  /** Height on the central channel. */
  y: number
  z: number
  petals: number
  /** Glow colour on the dark fields (the chart colour, lifted to read as light). */
  glow: string
}

export const CENTRES: Centre[] = [
  { id: 'mooladhara', name: 'Mooladhara', y: 0.16, z: 0.0, petals: 4, glow: '#FF6A55' },
  { id: 'swadisthan', name: 'Swadisthan', y: 0.38, z: 0.0, petals: 6, glow: '#FFD23F' },
  { id: 'nabhi', name: 'Nabhi', y: 0.52, z: 0.0, petals: 10, glow: '#4FD27A' },
  { id: 'void', name: 'Void', y: 0.5, z: 0.0, petals: 0, glow: '#5FE0B0' },
  { id: 'anahat', name: 'Anahat', y: 0.76, z: 0.0, petals: 12, glow: '#9A8CFF' },
  { id: 'vishuddhi', name: 'Vishuddhi', y: 1.02, z: 0.0, petals: 16, glow: '#9FD4FF' },
  { id: 'agnya', name: 'Agnya', y: 1.25, z: 0.07, petals: 2, glow: '#EEF1F6' },
  { id: 'sahasrara', name: 'Sahasrara', y: 1.47, z: 0.0, petals: 1000, glow: '#FFF3DA' },
]

export const KUNDALINI_Y = 0.26
export const CROWN_Y = 1.47

export type Fact = [label: string, value: string]

export type Chapter = {
  id: string
  title: string
  sub: string
  text: string
  facts?: Fact[]
  /** Chart colour, shown as a swatch beside the facts. */
  swatch?: string
  /** The solid field behind this chapter. */
  field: string
  /** Which centre the camera visits and lights. */
  centre?: CentreId
  link?: { href: string; label: string }
}

export const HERO_FIELD = '#F5F2EC'

export const CHAPTERS: Chapter[] = [
  {
    id: 'system',
    title: 'The subtle system',
    sub: 'Self-realisation, felt as a cool breeze.',
    text: 'Three channels, seven centres of energy and the Kundalini: an inner instrument that carries our evolution. Scroll, and travel through it.',
    field: '#0F0D0B',
  },
  {
    id: 'kundalini',
    title: 'Kundalini',
    sub: 'The mother within, coiled three and a half times',
    text: 'From kundala, a coil. She rests in the sacrum, the bone the ancient Greeks called sacred. She is the pure desire within us to ascend.',
    facts: [['Rests in', 'The sacrum'], ['Symbol', 'A coil of three and a half turns'], ['Felt as', 'A cool breeze']],
    field: '#15100A',
  },
  {
    id: 'ida',
    title: 'Ida',
    sub: 'The left channel, the moon',
    text: 'The channel of desire and emotion. It holds the past (memories, habits, conditionings) and ends in the right side of the brain, the superego.',
    facts: [['Time', 'The past'], ['Governs', 'Emotion, desire, memory'], ['In balance', 'Joy']],
    swatch: '#7FB2FF',
    field: '#0A1430',
  },
  {
    id: 'pingala',
    title: 'Pingala',
    sub: 'The right channel, the sun',
    text: 'The channel of action. Thinking, planning and doing carry us into the future; it ends in the left side of the brain, the ego.',
    facts: [['Time', 'The future'], ['Governs', 'Action, planning, thought'], ['In balance', 'Dynamism with a still mind']],
    swatch: '#FFB347',
    field: '#2A1206',
  },
  {
    id: 'sushumna',
    title: 'Sushumna',
    sub: 'The central channel, the present',
    text: 'The middle path, straight from the sacrum to the crown: the channel of our evolution. Along it the Kundalini rises, and here we live in the present.',
    facts: [['Time', 'The present'], ['Governs', 'Evolution, integration'], ['In balance', 'Balance itself']],
    swatch: '#F3D9A0',
    field: '#1A1608',
  },
  {
    id: 'mooladhara',
    centre: 'mooladhara',
    title: 'Mooladhara',
    sub: 'Innocence and wisdom',
    text: 'The first centre, below the sacrum: the support of the whole system. Its qualities are eternal. They can be clouded, never destroyed.',
    facts: [['Petals', '4'], ['Element', 'Earth'], ['Felt on', 'The base of the palm']],
    swatch: '#E8463A',
    field: '#2A0B07',
    link: { href: '/mooladhara', label: 'Meditate on Mooladhara' },
  },
  {
    id: 'swadisthan',
    centre: 'swadisthan',
    title: 'Swadisthan',
    sub: 'Creativity and pure knowledge',
    text: 'The centre of creativity. It gives the brain its energy for thought, and in balance inspiration comes without effort.',
    facts: [['Petals', '6'], ['Element', 'Fire'], ['Felt on', 'The thumbs']],
    swatch: '#F5C518',
    field: '#262005',
  },
  {
    id: 'nabhi',
    centre: 'nabhi',
    title: 'Nabhi',
    sub: 'Generosity, peace, contentment',
    text: 'At the level of the navel. In balance we feel satisfied and generous, and our attention becomes pure.',
    facts: [['Petals', '10'], ['Element', 'Water'], ['Felt on', 'The middle fingers']],
    swatch: '#2BA84A',
    field: '#06220F',
  },
  {
    id: 'void',
    centre: 'void',
    title: 'Void',
    sub: 'Bhavasagara, the ocean of illusion',
    text: 'The ocean around the Nabhi, and the place of the inner master. Crossing it, we become our own guide, with dignity and self-discipline.',
    facts: [['Element', 'The ocean'], ['Felt on', 'Around the centre of the palm'], ['In balance', 'Self-mastery']],
    swatch: '#3FB98A',
    field: '#052219',
  },
  {
    id: 'anahat',
    centre: 'anahat',
    title: 'Anahat',
    sub: 'Love, compassion, security',
    text: 'The heart centre, behind the sternum. It gives unconditional love, compassion and a deep sense of security: the absence of fear.',
    facts: [['Petals', '12'], ['Element', 'Air'], ['Felt on', 'The little fingers']],
    swatch: '#5B4FB3',
    field: '#120F2B',
  },
  {
    id: 'vishuddhi',
    centre: 'vishuddhi',
    title: 'Vishuddhi',
    sub: 'Communication and collectivity',
    text: 'At the throat. In balance we speak sweetly and see ourselves as part of the whole, watching as a witness.',
    facts: [['Petals', '16'], ['Element', 'Ether'], ['Felt on', 'The index fingers']],
    swatch: '#8EC5E8',
    field: '#071D2E',
  },
  {
    id: 'agnya',
    centre: 'agnya',
    title: 'Agnya',
    sub: 'Forgiveness',
    text: 'The narrow gate at the centre of the forehead. As we forgive, thought falls silent and the Kundalini passes through.',
    facts: [['Petals', '2'], ['Element', 'Light'], ['Felt on', 'The ring fingers']],
    swatch: '#C9CED6',
    field: '#15171C',
  },
  {
    id: 'sahasrara',
    centre: 'sahasrara',
    title: 'Sahasrara',
    sub: 'Integration',
    text: 'The thousand-petalled lotus at the crown, where every centre has its seat. Here our attention joins the all-pervading power.',
    facts: [['Petals', '1,000'], ['Element', 'All of them, integrated'], ['Felt on', 'The centre of the palm']],
    swatch: '#E4D4FF',
    field: '#140D22',
    link: { href: '/sahasrara', label: 'Meditate on Sahasrara' },
  },
  {
    id: 'opening',
    title: 'Self-realisation',
    sub: 'The Kundalini rises and pierces the crown',
    text: 'She rises through each centre, nourishing it, and emerges at the fontanel. The individual joins the whole, felt as a cool breeze above the head. It happens by itself: sahaja.',
    facts: [['Felt as', 'A cool breeze'], ['Given en masse since', '5 May 1970'], ['Cost', 'Always free']],
    field: '#0B0F1A',
  },
  {
    id: 'hands',
    title: 'On your hands',
    sub: 'Each finger speaks for a centre',
    text: 'After realisation the hands become a map. A tingle, warmth or heaviness on a finger shows which centre needs attention: the left hand for the left side, the right hand for the right.',
    field: '#0F0D0B',
  },
  {
    id: 'begin',
    title: 'Feel it yourself',
    sub: 'A few minutes, and always free',
    text: 'Sit comfortably, hands open on your lap, and let the journey happen inside you.',
    field: '#E5553D',
  },
]

/** Finger map for the hands chapter (research: hand_point per chakra). */
export const HAND_MAP: { point: 'heel' | 'centre' | 'ring' | 'thumb' | 'index' | 'middle' | 'little' | 'void'; centre: CentreId; label: string }[] = [
  { point: 'heel', centre: 'mooladhara', label: 'Mooladhara' },
  { point: 'thumb', centre: 'swadisthan', label: 'Swadisthan' },
  { point: 'middle', centre: 'nabhi', label: 'Nabhi' },
  { point: 'void', centre: 'void', label: 'Void' },
  { point: 'little', centre: 'anahat', label: 'Anahat' },
  { point: 'index', centre: 'vishuddhi', label: 'Vishuddhi' },
  { point: 'ring', centre: 'agnya', label: 'Agnya' },
  { point: 'centre', centre: 'sahasrara', label: 'Sahasrara' },
]
