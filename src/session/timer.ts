/**
 * Meditation timer computed from timestamps (never from interval ticks), so it stays
 * accurate when a tab is throttled in the background and can be restored after reload.
 * Pause intervals never accrue active time.
 */
export type TimerState = {
  /** active milliseconds banked before the current running stretch */
  accumulatedMs: number;
  /** wall-clock ms when the current running stretch began; null while paused */
  runningSince: number | null;
  /** optional countdown target; null = stopwatch */
  targetMs: number | null;
};

export const createTimer = (targetMs: number | null = null): TimerState => ({
  accumulatedMs: 0,
  runningSince: null,
  targetMs,
});

export function start(t: TimerState, now: number): TimerState {
  return t.runningSince === null ? { ...t, runningSince: now } : t;
}

export function pause(t: TimerState, now: number): TimerState {
  if (t.runningSince === null) return t;
  return { ...t, accumulatedMs: t.accumulatedMs + Math.max(0, now - t.runningSince), runningSince: null };
}

export function elapsed(t: TimerState, now: number): number {
  return t.accumulatedMs + (t.runningSince === null ? 0 : Math.max(0, now - t.runningSince));
}

export function remaining(t: TimerState, now: number): number | null {
  return t.targetMs === null ? null : Math.max(0, t.targetMs - elapsed(t, now));
}

export function isRunning(t: TimerState) {
  return t.runningSince !== null;
}

/** "12:05" / "1:02:09" with tabular digits handled by the font. */
export function formatClock(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const mm = h > 0 ? String(m).padStart(2, "0") : String(m);
  return `${h > 0 ? `${h}:` : ""}${mm}:${String(s).padStart(2, "0")}`;
}
