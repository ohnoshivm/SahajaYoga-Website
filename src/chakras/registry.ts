/**
 * Source-backed chakra registry. Colours, elements, fingers and petal counts follow
 * the official Sahaja Yoga USA chakra guides (us.sahajayoga.org/handouts) and
 * shrimataji.org; see research/data/subtle-system.json for the full extraction.
 * Copy lines paraphrase those guides; they make no medical or diagnostic claims.
 * `reviewed` flips to true only after a practitioner/content review.
 */

export type Finger = "palm-heel" | "thumb" | "index" | "middle" | "ring" | "little" | "palm-centre";

export type WorldTheme = {
  env: string; // environment background
  envHi: string; // light-pool tone of the environment
  glow: string; // the chakra's own hue (form, light)
  ink: string;
  soft: string;
};

export type ChakraForm =
  | { kind: "petals-square"; petals: 4 }
  | { kind: "petals-star"; petals: 6 | 12 }
  | { kind: "petals-triangle"; petals: 10 }
  | { kind: "petals-triangle-rings"; petals: 16 }
  | { kind: "two-petals" }
  | { kind: "thousand" };

export type Chakra = {
  n: number;
  slug: "mooladhara" | "swadisthan" | "nabhi" | "anahat" | "vishuddhi" | "agnya" | "sahasrara";
  name: string;
  quality: string; // the one word shown large in the Ascent
  title: string; // official guide title
  line: string; // ≤ 18 words
  element: string;
  colourName: string;
  finger: Finger;
  fingerLabel: string;
  form: ChakraForm;
  theme: WorldTheme;
  sources: string[];
  reviewed: boolean;
};

const GUIDES = "https://us.sahajayoga.org/handouts/";
const CHAKRAS_PAGE = "https://us.sahajayoga.org/chakras/";

export const CHAKRAS: Chakra[] = [
  {
    n: 1,
    slug: "mooladhara",
    name: "Mooladhara",
    quality: "Innocence",
    title: "Innocence and Wisdom",
    line: "The root of the whole system. Innocence can be covered, like the sun by cloud. Never lost.",
    element: "Earth",
    colourName: "Coral red",
    finger: "palm-heel",
    fingerLabel: "Felt at the base of the palm",
    form: { kind: "petals-square", petals: 4 },
    theme: { env: "#3b1a16", envHi: "#4a221d", glow: "#e8705a", ink: "#f6e7dc", soft: "#d9b9a8" },
    sources: [GUIDES, CHAKRAS_PAGE],
    reviewed: false,
  },
  {
    n: 2,
    slug: "swadisthan",
    name: "Swadhishthana",
    quality: "Creativity",
    title: "Creativity",
    line: "Attention without thought: to see a flower whole, without needing to know its name.",
    element: "Fire",
    colourName: "Yellow",
    finger: "thumb",
    fingerLabel: "Felt in the thumbs",
    form: { kind: "petals-star", petals: 6 },
    theme: { env: "#3a2e10", envHi: "#473915", glow: "#f2c94c", ink: "#f7eedb", soft: "#d8c79e" },
    sources: [GUIDES, CHAKRAS_PAGE],
    reviewed: false,
  },
  {
    n: 3,
    slug: "nabhi",
    name: "Nabhi",
    quality: "Contentment",
    title: "Generosity, Evolution, Contentment",
    line: "When the needs of life are met, the seeking turns inward, and generosity follows.",
    element: "Water",
    colourName: "Green",
    finger: "middle",
    fingerLabel: "Felt in the middle fingers",
    form: { kind: "petals-triangle", petals: 10 },
    theme: { env: "#12301f", envHi: "#173b27", glow: "#4fb377", ink: "#e8f2e6", soft: "#b5cdb7" },
    sources: [GUIDES, CHAKRAS_PAGE],
    reviewed: false,
  },
  {
    n: 4,
    slug: "anahat",
    name: "Anahat",
    quality: "Love",
    title: "Love, Compassion, Security",
    line: "The Spirit resides in the heart: love without condition, security without fear.",
    element: "Air",
    colourName: "Purple-blue",
    finger: "little",
    fingerLabel: "Felt in the little fingers",
    form: { kind: "petals-star", petals: 12 },
    theme: { env: "#211b3d", envHi: "#2a2349", glow: "#7e72d1", ink: "#ece9f7", soft: "#bdb6de" },
    sources: [GUIDES, CHAKRAS_PAGE],
    reviewed: false,
  },
  {
    n: 5,
    slug: "vishuddhi",
    name: "Vishuddhi",
    quality: "Collectivity",
    title: "Community and Relationships",
    line: "Speak from the heart, praise rather than criticise, and watch events without reacting.",
    element: "Ether",
    colourName: "Light blue",
    finger: "index",
    fingerLabel: "Felt in the index fingers",
    form: { kind: "petals-triangle-rings", petals: 16 },
    theme: { env: "#16324a", envHi: "#1c3d59", glow: "#8ec5e8", ink: "#eaf3f9", soft: "#afcbdf" },
    sources: [GUIDES, CHAKRAS_PAGE],
    reviewed: false,
  },
  {
    n: 6,
    slug: "agnya",
    name: "Agnya",
    quality: "Forgiveness",
    title: "Forgiveness",
    line: "The narrow gate between ego and conditioning. It opens one way only: by forgiving.",
    element: "Light",
    colourName: "Silver",
    finger: "ring",
    fingerLabel: "Felt in the ring fingers",
    form: { kind: "two-petals" },
    theme: { env: "#25282e", envHi: "#2d3138", glow: "#c9ced6", ink: "#f1f2f4", soft: "#b9bec6" },
    sources: [GUIDES, CHAKRAS_PAGE],
    reviewed: false,
  },
  {
    n: 7,
    slug: "sahasrara",
    name: "Sahasrara",
    quality: "Integration",
    title: "Integration",
    line: "The thousand-petalled lotus, where your own attention meets the whole.",
    element: "All elements",
    colourName: "All colours",
    finger: "palm-centre",
    fingerLabel: "Felt in the centre of the palm",
    form: { kind: "thousand" },
    theme: { env: "#f4f1ec", envHi: "#faf8f5", glow: "#c9a46a", ink: "#2e2a33", soft: "#5e5866" },
    sources: [GUIDES, CHAKRAS_PAGE],
    reviewed: false,
  },
];

export const chakraBySlug = (slug: string) => CHAKRAS.find((c) => c.slug === slug);
