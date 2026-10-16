import type { ChakraSlug } from "@/chakras/registry";

/**
 * kundalini / bandhan: guided gestures with a step count.
 * mahamantras: the Maha Mantras phase (text shown only once source-reviewed).
 * mantra: free counting in rounds of ten. chakra: a chakra's world, counting in rounds of ten.
 * silence: thoughtless awareness, optional countdown.
 */
export type PhaseKind = "kundalini" | "bandhan" | "mahamantras" | "mantra" | "chakra" | "silence";

export type Phase = {
  id: string;
  kind: PhaseKind;
  chakra?: ChakraSlug;
  /** for guided gestures: how many repetitions complete the phase */
  steps?: number;
  /** optional target for rounds of ten */
  targetRounds?: number;
  /** optional countdown (ms); undefined = untimed */
  durationMs?: number;
};

export type Routine = {
  id: string;
  name: string;
  minutes: number;
  phases: Phase[];
};

/**
 * Templates. Gesture counts follow the official Sahaja Yoga USA handouts
 * ("Raising the Inner Energy": 3 times; Bandhan, "shield of protection": 7 times).
 * Both the practitioner order and the source-informed order are offered; neither is "the only way".
 */
export const ROUTINES: Routine[] = [
  {
    id: "morning",
    name: "Morning Meditation",
    minutes: 24,
    phases: [
      { id: "m1", kind: "kundalini", steps: 3 },
      { id: "m2", kind: "bandhan", steps: 7 },
      { id: "m3", kind: "mahamantras" },
      { id: "m4", kind: "chakra", chakra: "vishuddhi", targetRounds: 3 },
      { id: "m5", kind: "silence", durationMs: 10 * 60_000 },
    ],
  },
  {
    id: "quick",
    name: "Quick sit",
    minutes: 10,
    phases: [{ id: "q1", kind: "mantra" }],
  },
  {
    id: "chakra",
    name: "Chakra focus",
    minutes: 15,
    phases: [
      { id: "c1", kind: "chakra", chakra: "vishuddhi" },
      { id: "c2", kind: "silence" },
    ],
  },
  {
    id: "evening",
    name: "Evening Meditation",
    minutes: 18,
    phases: [
      { id: "e1", kind: "kundalini", steps: 3 },
      { id: "e2", kind: "bandhan", steps: 7 },
      { id: "e3", kind: "chakra", chakra: "anahat" },
      { id: "e4", kind: "silence" },
    ],
  },
];

export const routineById = (id: string | null | undefined) => ROUTINES.find((r) => r.id === id) ?? ROUTINES[0];

export const PHASE_LABEL: Record<PhaseKind, string> = {
  kundalini: "Kundalini",
  bandhan: "Bandhan",
  mahamantras: "Maha Mantras",
  mantra: "Mantra",
  chakra: "Chakra",
  silence: "Silence",
};

export const PHASE_COPY: Record<PhaseKind, { title: string; guide: string }> = {
  kundalini: {
    title: "Raising the Kundalini",
    guide:
      "Left hand in front of the lower abdomen, palm toward you. Raise it up the front of the body while the right hand circles it clockwise. Above the head, tie a knot. Three times: one knot, then two, then three.",
  },
  bandhan: {
    title: "Bandhan",
    guide:
      "Rest the left hand on your lap, palm up. Raise the right hand from the left hip, over the head, down to the right hip, and back again. Seven times.",
  },
  mahamantras: {
    title: "Maha Mantras",
    guide:
      "Say the Maha Mantras in your own way. Their exact text will appear here once it has been reviewed against the published Sahaja Yoga source.",
  },
  mantra: { title: "Mantra", guide: "Tap once for each repetition. Ten make one round." },
  chakra: { title: "Chakra meditation", guide: "Rest your attention on the chakra. Tap once for each mantra; ten make one round." },
  silence: { title: "Silence", guide: "Sit in thoughtless awareness. When thoughts come, let them pass." },
};
