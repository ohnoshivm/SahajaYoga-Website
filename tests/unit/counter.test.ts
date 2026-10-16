import { describe, expect, it } from "vitest";
import {
  DEFAULT_ROUND_SIZE,
  averageLapMs,
  createCounter,
  lapDurations,
  reset,
  tap,
  undo,
  view,
} from "@/session/counter";

function tapN(n: number, size?: number) {
  let s = createCounter(0, size);
  for (let i = 1; i <= n; i++) s = tap(s, i * 1000);
  return s;
}

describe("mantra counter: 10 laps per round", () => {
  it("defaults to a round size of 10", () => {
    expect(DEFAULT_ROUND_SIZE).toBe(10);
    expect(createCounter(0).roundSize).toBe(10);
  });

  it.each([
    // taps, completedRounds, currentLap, roundJustCompleted, displayLap, displayRound
    [0, 0, 0, false, 0, 1],
    [9, 0, 9, false, 9, 1],
    [10, 1, 0, true, 10, 1],
    [11, 1, 1, false, 1, 2],
    [20, 2, 0, true, 10, 2],
    [21, 2, 1, false, 1, 3],
  ])("%i taps → %i rounds, lap %i", (taps, rounds, lap, boundary, displayLap, displayRound) => {
    const v = view(tapN(taps));
    expect(v.totalTaps).toBe(taps);
    expect(v.completedRounds).toBe(rounds);
    expect(v.currentLap).toBe(lap);
    expect(v.roundJustCompleted).toBe(boundary);
    expect(v.displayLap).toBe(displayLap);
    expect(v.displayRound).toBe(displayRound);
  });

  it("the 10th tap closes round 1 and the 11th belongs to round 2", () => {
    expect(view(tapN(10)).completedRounds).toBe(1);
    const eleven = view(tapN(11));
    expect(eleven.completedRounds).toBe(1);
    expect(eleven.displayRound).toBe(2);
    expect(eleven.displayLap).toBe(1);
  });

  it("never shows an ambiguous lap 0 after counting has begun", () => {
    for (let n = 1; n <= 40; n++) expect(view(tapN(n)).displayLap).toBeGreaterThan(0);
  });

  it("undo across the round boundary: 10 → 9 taps, 0 rounds", () => {
    const v = view(undo(tapN(10)));
    expect(v.totalTaps).toBe(9);
    expect(v.completedRounds).toBe(0);
    expect(v.currentLap).toBe(9);
  });

  it("undo from 11 → 10 taps, 1 completed round", () => {
    const v = view(undo(tapN(11)));
    expect(v.totalTaps).toBe(10);
    expect(v.completedRounds).toBe(1);
    expect(v.roundJustCompleted).toBe(true);
  });

  it("undo works after a JSON round-trip (restored session)", () => {
    const restored = JSON.parse(JSON.stringify(tapN(11)));
    expect(view(undo(restored)).completedRounds).toBe(1);
  });

  it("undo on an empty counter is a no-op", () => {
    const s = createCounter(0);
    expect(undo(s)).toBe(s);
  });

  it("reset clears taps and restarts the clock", () => {
    const r = reset(tapN(7), 50_000);
    expect(view(r).totalTaps).toBe(0);
    expect(r.startedAt).toBe(50_000);
  });

  it("measures lap durations from the start, then between taps", () => {
    let s = createCounter(1000);
    s = tap(s, 3000);
    s = tap(s, 4500);
    s = tap(s, 7000);
    expect(lapDurations(s)).toEqual([2000, 1500, 2500]);
    expect(averageLapMs(s)).toBe(2000);
  });

  it("does not report an average for fewer than three laps", () => {
    expect(averageLapMs(tapN(2))).toBeNull();
  });

  it("supports a configurable round size while defaulting to 10", () => {
    const v = view(tapN(12, 12));
    expect(v.completedRounds).toBe(1);
    expect(() => createCounter(0, 0)).toThrow();
  });

  it("rapid deliberate taps are all counted (no debounce dropping)", () => {
    let s = createCounter(0);
    for (let i = 0; i < 10; i++) s = tap(s, 100 + i * 40);
    expect(view(s).completedRounds).toBe(1);
  });
});
