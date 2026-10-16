import { create } from "zustand";

/**
 * Hold-to-bloom state. `progress` is integrated every frame by the 3D scene
 * (read with getState() inside useFrame, so React never re-renders per frame).
 * DOM components subscribe only to the coarse booleans.
 */
export type BloomState = {
  /** 0 = closed bud, 1 = fully open lotus */
  progress: number;
  holding: boolean;
  bloomed: boolean;
  /** performance.now() timestamp when the bloom completed (drives the breeze) */
  bloomedAt: number | null;
  /** 0..1 pointer speed while holding; stillness lets the lotus open smoothly */
  agitation: number;
  setHolding: (holding: boolean) => void;
  setProgress: (progress: number) => void;
  completeBloom: (instant?: boolean) => void;
  setAgitation: (agitation: number) => void;
};

export { HOLD_SECONDS, RELEASE_SPEED } from "./bloomStep";
const STORAGE_KEY = "sy.bloomed";

export const useBloom = create<BloomState>((set, get) => ({
  progress: 0,
  holding: false,
  bloomed: false,
  bloomedAt: null,
  agitation: 0,
  setHolding: (holding) => {
    if (get().bloomed) return;
    set({ holding });
  },
  setProgress: (progress) => set({ progress }),
  completeBloom: (instant = false) => {
    if (get().bloomed) return;
    set({
      progress: 1,
      holding: false,
      bloomed: true,
      bloomedAt: instant ? null : performance.now(),
    });
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* storage unavailable (private mode): bloom simply isn't remembered */
    }
  },
  setAgitation: (agitation) => set({ agitation }),
}));

/** Returning visitors arrive with the lotus already open (never a gate). */
export function restoreBloom() {
  try {
    if (window.localStorage.getItem(STORAGE_KEY) === "1") {
      useBloom.setState({ progress: 1, bloomed: true, bloomedAt: null, holding: false });
    }
  } catch {
    /* ignore */
  }
}

if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
  (window as unknown as { __bloom: typeof useBloom }).__bloom = useBloom;
}
