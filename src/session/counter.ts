/**
 * Mantra counter: one tap = one repetition (lap). DEFAULT: 10 laps = 1 round.
 * Tap 11 is round 2, lap 1. Pure and framework-free so it can be unit-tested
 * and persisted/restored as plain JSON.
 */

export const DEFAULT_ROUND_SIZE = 10;

export type CounterState = {
  roundSize: number;
  /** monotonic-ish timestamps (ms) of every tap, in order */
  taps: number[];
  /** when counting started (first lap is measured from here) */
  startedAt: number;
};

export type CounterView = {
  totalTaps: number;
  completedRounds: number;
  /** taps into the round in progress (0..roundSize-1) */
  currentLap: number;
  /** true exactly on a multiple of roundSize (>0): show "Round N complete", never "lap 0" */
  roundJustCompleted: boolean;
  /** lap number to display (1..roundSize); equals roundSize on a completed boundary */
  displayLap: number;
  /** round number to display: the round in progress, or the one just completed */
  displayRound: number;
  /** taps belonging to an unfinished round */
  incompleteRoundTaps: number;
};

export function createCounter(startedAt: number, roundSize = DEFAULT_ROUND_SIZE): CounterState {
  if (!Number.isInteger(roundSize) || roundSize < 1) throw new Error("roundSize must be a positive integer");
  return { roundSize, taps: [], startedAt };
}

export function tap(state: CounterState, at: number): CounterState {
  return { ...state, taps: [...state.taps, at] };
}

export function undo(state: CounterState): CounterState {
  if (state.taps.length === 0) return state;
  return { ...state, taps: state.taps.slice(0, -1) };
}

export function reset(state: CounterState, at: number): CounterState {
  return { ...state, taps: [], startedAt: at };
}

export function view(state: CounterState): CounterView {
  const total = state.taps.length;
  const size = state.roundSize;
  const completedRounds = Math.floor(total / size);
  const currentLap = total % size;
  const roundJustCompleted = total > 0 && currentLap === 0;
  return {
    totalTaps: total,
    completedRounds,
    currentLap,
    roundJustCompleted,
    displayLap: roundJustCompleted ? size : currentLap,
    displayRound: roundJustCompleted ? completedRounds : completedRounds + 1,
    incompleteRoundTaps: currentLap,
  };
}

/** Durations of each lap: start → first tap, then between successive taps. */
export function lapDurations(state: CounterState): number[] {
  const out: number[] = [];
  let prev = state.startedAt;
  for (const t of state.taps) {
    out.push(Math.max(0, t - prev));
    prev = t;
  }
  return out;
}

/** Average lap interval, or null when there are too few laps to be meaningful. */
export function averageLapMs(state: CounterState): number | null {
  const d = lapDurations(state);
  if (d.length < 3) return null;
  return d.reduce((a, b) => a + b, 0) / d.length;
}
