/**
 * Chakra registry. Qualities, colours, elements and finger mapping come from the
 * official Sahaja Yoga USA chakra guides (research/data/subtle-system.json).
 * Raga associations are traditional; recordings are credited with their licence.
 */
export type ChakraTheme = {
  field: string // full-screen background
  ink: string // text on the field (AA+ on field)
  inkSoft: string
  glow: string // light used for tap pulses and the round sweep
}

export type RagaInfo = {
  name: string
  /** Bundled full piece, played first. */
  file: string
  /** The same passage on its archive, used if the bundled file is missing. */
  stream?: { url: string; start: number; end: number }
  /** Short performer line for the player. */
  artist: string
  credit: { performers: string; source: string; license: string; url: string }
  /** Tanpura fallback tuning (Sa in Hz). */
  sa: number
}

export type Chakra = {
  slug: string
  number: number
  name: string
  quality: string
  element: string
  felt: string
  raga: RagaInfo
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
    stream: {
      url: 'https://archive.org/download/dni.ncaa.SKSS-G346-AC/SKSS-G346-AC_SIDE_B.mp3',
      start: 1378,
      end: 2838.8,
    },
    artist: 'Pt. V. G. Jog · violin',
    credit: {
      performers: 'Pandit Vishnu Govind Jog (violin), Pandit Jnan Prakash Ghosh (tabla)',
      source: 'Shri Kashi Sangeet Samaj, Varanasi · National Cultural Audiovisual Archives (IGNCA)',
      license: 'CC BY-NC 4.0',
      url: 'https://archive.org/details/dni.ncaa.SKSS-G346-AC',
    },
    sa: 139.7,
  },
  theme: {
    field: '#E5553D',
    ink: '#1F0806',
    inkSoft: 'rgba(31, 8, 6, 0.62)',
    glow: '#FFE9DC',
  },
}

export const CHAKRAS: Record<string, Chakra> = { mooladhara: MOOLADHARA }
