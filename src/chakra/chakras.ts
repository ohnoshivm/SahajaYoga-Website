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
  /** Lights for the 3D form: key, warm fill, rim. */
  light: { key: string; fill: string; rim: string }
}

export type Credit = { performers: string; source: string; license: string; url: string }

export type Recording = {
  id: string
  kind: 'file'
  /** Instrument or performer, shown in the picker. */
  label: string
  /** Short performer line for the player. */
  artist: string
  length: string
  /** Bundled full piece, played first. */
  file: string
  /** The same passage on its archive, used if the bundled file is missing. */
  stream?: { url: string; start: number; end: number }
  credit: Credit
}

export type RagaInfo = {
  name: string
  recordings: Recording[]
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
    sa: 139.7,
    recordings: [
      {
        id: 'jog-violin',
        kind: 'file',
        label: 'Violin',
        artist: 'Pt. V. G. Jog · violin',
        length: '24:20',
        file: '/audio/mooladhara-shyam-kalyan.mp3',
        stream: {
          url: 'https://archive.org/download/dni.ncaa.SKSS-G346-AC/SKSS-G346-AC_SIDE_B.mp3',
          start: 1378,
          end: 2838.8,
        },
        credit: {
          performers: 'Pandit Vishnu Govind Jog (violin), Pandit Jnan Prakash Ghosh (tabla)',
          source: 'Shri Kashi Sangeet Samaj, Varanasi · National Cultural Audiovisual Archives (IGNCA)',
          license: 'CC BY-NC 4.0',
          url: 'https://archive.org/details/dni.ncaa.SKSS-G346-AC',
        },
      },
      {
        id: 'bhatt-sitar',
        kind: 'file',
        label: 'Sitar',
        artist: 'Pt. Krishnamohan Bhatt · sitar',
        length: '46:28',
        file: '/audio/mooladhara-shyam-kalyan-sitar.mp3',
        credit: {
          performers: 'Pandit Krishnamohan Bhatt (sitar), Pandit Nandan Mehta (tabla), live, Ahmedabad, 1 June 1982',
          source: 'Saptak Archives, Ahmedabad · National Cultural Audiovisual Archives (IGNCA)',
          license: 'CC BY-NC 4.0',
          url: 'https://archive.org/details/dni.ncaa.SA-125-AC',
        },
      },
      {
        id: 'gupta',
        kind: 'file',
        label: 'Sahaja music',
        artist: 'Aakash Gupta',
        length: '4:48',
        file: '/audio/mooladhara-shyam-kalyan-gupta.mp3',
        credit: {
          performers: 'Aakash Gupta',
          source: 'Sahaja Yoga - Raga for Mooladhara - Shyam Kalyan',
          license: 'Used with permission',
          url: 'https://www.youtube.com/watch?v=1H60sWcCrNE',
        },
      },
    ],
  },
  theme: {
    field: '#E5553D',
    ink: '#1F0806',
    inkSoft: 'rgba(31, 8, 6, 0.62)',
    glow: '#FFE9DC',
    light: { key: '#fff1e6', fill: '#ffb59c', rim: '#ff9f86' },
  },
}

export const SAHASRARA: Chakra = {
  slug: 'sahasrara',
  number: 7,
  name: 'Sahasrara',
  quality: 'Integration',
  element: 'All elements',
  felt: 'Centre of the palm',
  raga: {
    name: 'Raga Darbari Kanada',
    sa: 138.6,
    recordings: [
      {
        id: 'gupta',
        kind: 'file',
        label: 'Sahaja music',
        artist: 'Aakash Gupta',
        length: '9:31',
        file: '/audio/sahasrara-darbari-kanada-gupta.mp3',
        credit: {
          performers: 'Aakash Gupta',
          source: 'Sahaja Yoga - Raga for Sahastrara - Darbari Kanada',
          license: 'Used with permission',
          url: 'https://www.youtube.com/watch?v=ARpS0cDoo2M',
        },
      },
    ],
  },
  theme: {
    field: '#F5F2EC',
    ink: '#15120E',
    inkSoft: 'rgba(21, 18, 14, 0.62)',
    glow: '#E4D4FF',
    light: { key: '#ffffff', fill: '#fff1de', rim: '#e3d8ff' },
  },
}

/** In order up the spine; only the built ones are listed. */
export const CHAKRA_LIST: Chakra[] = [MOOLADHARA, SAHASRARA]
export const CHAKRAS: Record<string, Chakra> = Object.fromEntries(CHAKRA_LIST.map((c) => [c.slug, c]))
