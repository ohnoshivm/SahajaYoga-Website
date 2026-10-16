import { describe, expect, it } from "vitest";
import { createTimer, elapsed, formatClock, pause, remaining, start } from "@/session/timer";

describe("meditation timer", () => {
  it("counts only active time; pauses do not accrue", () => {
    let t = start(createTimer(), 0);
    t = pause(t, 60_000); // 1 min active
    // 10 minutes paused
    t = start(t, 660_000);
    expect(elapsed(t, 690_000)).toBe(90_000);
  });

  it("is computed from timestamps, so a throttled background tab stays accurate", () => {
    const t = start(createTimer(), 1_000);
    expect(elapsed(t, 1_000 + 25 * 60_000)).toBe(25 * 60_000);
  });

  it("survives a JSON round-trip (reload restore)", () => {
    const t = JSON.parse(JSON.stringify(start(createTimer(), 5_000)));
    expect(elapsed(t, 65_000)).toBe(60_000);
  });

  it("double start / double pause are harmless", () => {
    let t = start(start(createTimer(), 0), 10_000);
    expect(elapsed(t, 20_000)).toBe(20_000);
    t = pause(pause(t, 30_000), 40_000);
    expect(elapsed(t, 99_000)).toBe(30_000);
  });

  it("countdown reports remaining time and never goes negative", () => {
    const t = start(createTimer(10 * 60_000), 0);
    expect(remaining(t, 4 * 60_000)).toBe(6 * 60_000);
    expect(remaining(t, 99 * 60_000)).toBe(0);
    expect(remaining(createTimer(), 0)).toBeNull();
  });

  it("formats clocks", () => {
    expect(formatClock(0)).toBe("0:00");
    expect(formatClock(65_000)).toBe("1:05");
    expect(formatClock(3_725_000)).toBe("1:02:05");
  });
});
