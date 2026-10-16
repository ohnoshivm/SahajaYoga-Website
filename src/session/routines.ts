import type { Chakra } from "@/chakras/registry";

export type PhaseKind = "kundalini" | "bandhan" | "mantra" | "chakra" | "silence";

export type Phase = {
  id: string;
  kind: PhaseKind;
  chakra?: Chakra["slug"];
  /** for guided gestures: how many repetitions make the phase complete */
  steps?: number;
  /** optional countdown for the phase (ms); undefined = untimed */
  durationMs?: number;
};

export type Routine = {
  id: string;
  name: string;
  summary: string;
  phases: Phase[];
};

/**
 * Templates. Gesture counts follow the official Sahaja Yoga USA handout
 * ("Raising the Inner Energy": 3 times; "Shield of protection": 7 times).
 * The practitioner order (Bandhan → mantras → chakra → rounds → silence) is offered because
 * the user requested it, not as the only valid order.
 */
export const ROUTINES: Routine[] = [
  {
    id: "quick",
    name: "Quick meditation",
    summary: "Straight into silence, with the counter ready if you want it.",
    phases: [{ id: "q1", kind: "silence" }],
  },
  {
    id: "daily",
    name: "Daily practice",
    summary: "Raise the Kundalini, Bandhan, mantra rounds, a chakra, then silence.",
    phases: [
      { id: "d1", kind: "kundalini", steps: 3 },
      { id: "d2", kind: "bandhan", steps: 7 },
      { id: "d3", kind: "mantra" },
      { id: "d4", kind: "chakra", chakra: "vishuddhi" },
      { id: "d5", kind: "silence" },
    ],
  },
  {
    id: "chakra",
    name: "Chakra focus",
    summary: "One chakra's world, its raga if you wish, then silence.",
    phases: [
      { id: "c1", kind: "chakra", chakra: "vishuddhi" },
      { id: "c2", kind: "silence" },
    ],
  },
];

export const routineById = (id: string | null | undefined) => ROUTINES.find((r) => r.id === id) ?? ROUTINES[0];

export const PHASE_COPY: Record<PhaseKind, { title: string; guide: string[] }> = {
  kundalini: {
    title: "Raising the Kundalini",
    guide: [
      "Sit comfortably, attention on the top of your head.",
      "Left hand in front of the lower abdomen, palm toward you. Raise it while the right hand circles it clockwise.",
      "Above the head, tie a knot with both hands. Tap once each time you tie, three times in all: one knot, then two, then three.",
    ],
  },
  bandhan: {
    title: "Bandhan",
    guide: [
      "Left palm open on your lap. The right hand rises from the left hip, over the head, down to the right hip, and back again.",
      "Keep about two inches from the body. Tap once for each complete arc. Seven in all.",
    ],
  },
  mantra: {
    title: "Mantra rounds",
    guide: [
      "Tap once for each repetition. Ten repetitions make one round.",
      "Eyes closed is fine: the whole screen is the counter. Space or Enter also count.",
    ],
  },
  chakra: {
    title: "Chakra meditation",
    guide: ["Rest your attention on the chakra. Let the thoughts settle; there is nothing to do."],
  },
  silence: {
    title: "Silence",
    guide: ["Sit in thoughtless awareness. When thoughts come, let them pass."],
  },
};
