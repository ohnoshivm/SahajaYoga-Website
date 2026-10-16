/**
 * Source-backed chakra registry. Colours, elements, fingers and petal counts follow
 * the official Sahaja Yoga USA chakra guides (us.sahajayoga.org/handouts) and
 * shrimataji.org; see research/data/subtle-system.json for the full extraction.
 * Copy paraphrases those guides and makes no medical or diagnostic claims.
 * World colours are the approved design tokens (design/styles.css).
 * `reviewed` flips to true only after a practitioner review.
 */

export type ChakraSlug = "mooladhara" | "swadisthan" | "nabhi" | "anahat" | "vishuddhi" | "agnya" | "sahasrara";

export type WorldTheme = {
  env: string; // deep field
  envHi: string; // light pool at the centre of the field
  envLo: string; // edges
  glow: string; // the chakra's own hue: the form and its light
  ink: string;
  soft: string;
};

export type Chakra = {
  n: number;
  slug: ChakraSlug;
  name: string;
  ordinal: string;
  petals: number;
  quality: string; // one word, shown large in the Ascent
  where: string; // "at the base of the spine"
  element: string;
  colourName: string;
  felt: string; // "Felt at the base of the palms."
  fingerShort: string; // "Index fingers"
  worldLine: string; // the single line in its world
  theme: WorldTheme;
  sources: string[];
  reviewed: boolean;
};

const GUIDES = "https://us.sahajayoga.org/handouts/";
const CHAKRAS_PAGE = "https://us.sahajayoga.org/chakras/";

export const CHAKRAS: Chakra[] = [
  {
    n: 1, slug: "mooladhara", name: "Mooladhara", ordinal: "first", petals: 4, quality: "Innocence",
    where: "at the base of the spine", element: "Earth", colourName: "Coral red",
    felt: "Felt at the base of the palms.", fingerShort: "Base of the palms",
    worldLine: "The centre of innocence and wisdom.",
    theme: { env: "#3b1a16", envHi: "#5a2a22", envLo: "#26100d", glow: "#e8705a", ink: "#f6e7dc", soft: "#d9b9a8" },
    sources: [GUIDES, CHAKRAS_PAGE], reviewed: false,
  },
  {
    n: 2, slug: "swadisthan", name: "Swadishthan", ordinal: "second", petals: 6, quality: "Creativity",
    where: "above the sacrum", element: "Fire", colourName: "Yellow",
    felt: "Felt in the thumbs.", fingerShort: "Thumbs",
    worldLine: "The centre of creativity and pure attention.",
    theme: { env: "#3a2e10", envHi: "#574619", envLo: "#241c09", glow: "#f2c94c", ink: "#f7eedb", soft: "#d8c79e" },
    sources: [GUIDES, CHAKRAS_PAGE], reviewed: false,
  },
  {
    n: 3, slug: "nabhi", name: "Nabhi", ordinal: "third", petals: 10, quality: "Contentment",
    where: "at the navel", element: "Water", colourName: "Green",
    felt: "Felt in the middle fingers.", fingerShort: "Middle fingers",
    worldLine: "The centre of generosity, contentment and peace.",
    theme: { env: "#12301f", envHi: "#1d4a31", envLo: "#0a1f14", glow: "#4fb377", ink: "#e8f2e6", soft: "#b5cdb7" },
    sources: [GUIDES, CHAKRAS_PAGE], reviewed: false,
  },
  {
    n: 4, slug: "anahat", name: "Anahat", ordinal: "fourth", petals: 12, quality: "Love",
    where: "behind the sternum", element: "Air", colourName: "Purple-blue",
    felt: "Felt in the little fingers.", fingerShort: "Little fingers",
    worldLine: "The centre of love, compassion and security.",
    theme: { env: "#211b3d", envHi: "#342b5c", envLo: "#141027", glow: "#7e72d1", ink: "#ece9f7", soft: "#bdb6de" },
    sources: [GUIDES, CHAKRAS_PAGE], reviewed: false,
  },
  {
    n: 5, slug: "vishuddhi", name: "Vishuddhi", ordinal: "fifth", petals: 16, quality: "Communication",
    where: "at the neck", element: "Ether", colourName: "Light blue",
    felt: "Felt in the index fingers.", fingerShort: "Index fingers",
    worldLine: "The centre of communication, diplomacy and collectivity.",
    theme: { env: "#16324a", envHi: "#24506f", envLo: "#0d2133", glow: "#8ec5e8", ink: "#eaf3f9", soft: "#afcbdf" },
    sources: [GUIDES, CHAKRAS_PAGE], reviewed: false,
  },
  {
    n: 6, slug: "agnya", name: "Agnya", ordinal: "sixth", petals: 2, quality: "Forgiveness",
    where: "at the centre of the forehead", element: "Light", colourName: "Silver",
    felt: "Felt in the ring fingers.", fingerShort: "Ring fingers",
    worldLine: "The centre of forgiveness and humility.",
    theme: { env: "#25282e", envHi: "#383c44", envLo: "#17191d", glow: "#c9ced6", ink: "#f1f2f4", soft: "#b9bec6" },
    sources: [GUIDES, CHAKRAS_PAGE], reviewed: false,
  },
  {
    n: 7, slug: "sahasrara", name: "Sahasrara", ordinal: "seventh", petals: 1000, quality: "Integration",
    where: "the thousand-petalled lotus at the crown", element: "All elements", colourName: "All colours",
    felt: "Felt at the centre of the palm.", fingerShort: "Centre of the palm",
    worldLine: "The thousand-petalled lotus, where every centre is integrated.",
    theme: { env: "#f1ece5", envHi: "#faf7f2", envLo: "#e2d9cd", glow: "#f4ede4", ink: "#2e2a33", soft: "#5e5866" },
    sources: [GUIDES, CHAKRAS_PAGE], reviewed: false,
  },
];

export const chakraBySlug = (slug: string) => CHAKRAS.find((c) => c.slug === slug);

/** "The fifth centre, at the neck. Element: ether. Felt in the index fingers." */
export function ascentLine(c: Chakra) {
  if (c.slug === "sahasrara") return `The ${c.ordinal} centre, ${c.where}. ${c.felt}`;
  return `The ${c.ordinal} centre, ${c.where}. Element: ${c.element.toLowerCase()}. ${c.felt}`;
}

/** CSS custom properties for a chakra world. */
export function worldVars(c: Chakra): Record<string, string> {
  const t = c.theme;
  return { "--env": t.env, "--env-hi": t.envHi, "--env-lo": t.envLo, "--glow": t.glow, "--wink": t.ink, "--wsoft": t.soft };
}
