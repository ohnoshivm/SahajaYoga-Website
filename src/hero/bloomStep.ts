export const HOLD_SECONDS = 4;
export const RELEASE_SPEED = 1.5;

export type BloomInput = { progress: number; holding: boolean; agitation: number };
export type BloomResult = { progress: number; completed: boolean };

/**
 * One frame of hold-to-bloom. Holding opens the lotus over HOLD_SECONDS;
 * a fast-moving pointer slows the opening (stillness helps) but never stops it;
 * releasing early closes it softly at RELEASE_SPEED×.
 */
export function stepBloom({ progress, holding, agitation }: BloomInput, dtSeconds: number): BloomResult {
  const dt = Math.min(Math.max(dtSeconds, 0), 1 / 20);
  if (holding) {
    const rate = (1 / HOLD_SECONDS) * (1 - 0.45 * Math.min(1, Math.max(0, agitation)));
    const next = Math.min(1, progress + dt * rate);
    return { progress: next, completed: next >= 1 };
  }
  return { progress: Math.max(0, progress - (dt * RELEASE_SPEED) / HOLD_SECONDS), completed: false };
}
