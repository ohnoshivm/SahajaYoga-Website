import { describe, expect, it } from "vitest";
import { HOLD_SECONDS, stepBloom } from "@/hero/bloomStep";

function hold(seconds: number, agitation = 0) {
  let p = 0;
  let completed = false;
  const dt = 1 / 60;
  for (let t = 0; t < seconds && !completed; t += dt) {
    const r = stepBloom({ progress: p, holding: true, agitation }, dt);
    p = r.progress;
    completed = r.completed;
  }
  return { p, completed };
}

describe("hold to bloom", () => {
  it("opens fully after holding still for HOLD_SECONDS", () => {
    expect(hold(HOLD_SECONDS + 0.1).completed).toBe(true);
  });
  it("is not complete before HOLD_SECONDS", () => {
    expect(hold(HOLD_SECONDS - 0.5).completed).toBe(false);
  });
  it("stillness helps: an agitated pointer opens more slowly but still opens", () => {
    expect(hold(HOLD_SECONDS + 0.1, 1).completed).toBe(false);
    expect(hold(HOLD_SECONDS * 2, 1).completed).toBe(true);
  });
  it("releasing early closes the bud softly", () => {
    const r = stepBloom({ progress: 0.5, holding: false, agitation: 0 }, 1 / 60);
    expect(r.progress).toBeLessThan(0.5);
    expect(r.completed).toBe(false);
  });
  it("clamps giant frame gaps (background tab) so it never jumps open", () => {
    const r = stepBloom({ progress: 0, holding: true, agitation: 0 }, 10);
    expect(r.progress).toBeLessThan(0.02);
  });
});
