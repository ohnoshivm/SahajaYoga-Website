/**
 * Chakra registry. Qualities, colours, elements and finger mapping come from the
 * official Sahaja Yoga USA chakra guides (research/data/subtle-system.json).
 * Raga associations are traditional candidates and need confirming before launch.
 */
export type ChakraTheme = {
  field: string // full-screen background
  ink: string // text on the field (AA+ on field)
  inkSoft: string
  glow: string // light used for tap pulses and the round sweep
}

export type Chakra = {
  slug: string
  number: number
  name: string
  quality: string
  element: string
  felt: string
  raga: { name: string; file: string; drone: { sa: number } }
  theme: ChakraTheme
}

export const MOOLADHARA: Chakra = {
  slug: 'mooladhara',
  number: 1,
  name: 'Mooladhara',
  quality: 'Innocence and Wisdom',
  element: 'Earth',
  felt: 'Base of the palm',
  raga: {
    name: 'Raga Shyam Kalyan',
    file: '/audio/mooladhara-shyam-kalyan.mp3',
    drone: { sa: 138.59 },
  },
  theme: {
    field: '#E5553D',
    ink: '#1F0806',
    inkSoft: 'rgba(31, 8, 6, 0.62)',
    glow: '#FFE9DC',
  },
}

export const CHAKRAS: Record<string, Chakra> = { mooladhara: MOOLADHARA }
