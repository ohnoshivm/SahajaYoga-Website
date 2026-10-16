"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

/** Personal preferences, stored locally. Sound and haptics are off until chosen. */
export type Prefs = {
  haptics: boolean;
  bell: boolean;
  showCount: boolean;
  chakraMusic: "unset" | "on" | "off";
  set: (p: Partial<Omit<Prefs, "set">>) => void;
};

export const usePrefs = create<Prefs>()(
  persist(
    (set) => ({
      haptics: false,
      bell: false,
      showCount: true,
      chakraMusic: "unset",
      set: (p) => set(p),
    }),
    { name: "sy.prefs.v1", storage: createJSONStorage(() => localStorage) },
  ),
);

let ctx: AudioContext | null = null;
/** A soft, short sine bell (synthesised; no recorded asset). */
export function softBell() {
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = 528;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.4);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 2.5);
  } catch {
    /* audio unavailable */
  }
}

export function pulse(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
}
