"use client";

import { useEffect, useRef, useState } from "react";
import * as C from "@/session/counter";
import * as T from "@/session/timer";
import { useSession } from "@/session/sessionStore";
import { pulse, softBell, usePrefs } from "@/meditation/prefs";

/** "06:12", "12:48", "1:02:09": minutes always two digits, like the design. */
export function clock(ms: number) {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600), m = Math.floor((total % 3600) / 60), s = total % 60;
  return `${h ? `${h}:` : ""}${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Re-renders a few times a second with the session's active time (paused time never counts). */
export function useElapsed() {
  const timer = useSession((s) => s.session?.timer);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);
  return timer ? T.elapsed(timer, now) : 0;
}

export function useCounterView() {
  const counter = useSession((s) => s.session?.counter);
  return counter ? C.view(counter) : null;
}

/**
 * The whole screen is the counter: tap / click / Space / Enter count, Backspace undoes,
 * P pauses or resumes. Taps at chanting speed are never dropped (no debounce),
 * but a multi-touch gesture counts once.
 */
export function useCountInput(surface: React.RefObject<HTMLElement | null>, enabled: boolean, opts: { onAnyInput?: () => void } = {}) {
  const tap = useSession((s) => s.tap);
  const undo = useSession((s) => s.undo);
  const pause = useSession((s) => s.pause);
  const resume = useSession((s) => s.resume);
  const status = useSession((s) => s.session?.status);
  const bell = usePrefs((s) => s.bell);
  const haptics = usePrefs((s) => s.haptics);
  const onAny = useRef(opts.onAnyInput);
  onAny.current = opts.onAnyInput;

  const count = () => {
    const before = useSession.getState().session?.counter;
    tap();
    const after = useSession.getState().session?.counter;
    if (!before || !after || after.taps.length === before.taps.length) return;
    const v = C.view(after);
    if (haptics) pulse(v.roundJustCompleted ? [30, 60, 30] : 12);
    if (bell && v.roundJustCompleted) softBell();
  };

  useEffect(() => {
    if (!enabled) return;
    const el = surface.current;
    const onDown = (e: PointerEvent) => {
      if (!e.isPrimary || e.button > 0) return;
      if ((e.target as Element | null)?.closest?.("button, a, input, textarea, iframe, [data-no-count]")) return;
      count();
      onAny.current?.();
    };
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as Element | null;
      if (t?.closest?.("input, textarea")) return;
      if ((e.key === " " || e.key === "Enter") && !t?.closest?.("button, a")) {
        e.preventDefault();
        if (!e.repeat) count();
      } else if (e.key === "Backspace") {
        e.preventDefault();
        undo();
      } else if (e.key.toLowerCase() === "p") {
        if (useSession.getState().session?.status === "paused") resume();
        else pause();
      }
      onAny.current?.();
    };
    el?.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      el?.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, surface, status, bell, haptics]);
}

/** Session heartbeat + recovery after reloads; keeps the screen awake while meditating. */
export function useSessionLife(active: boolean) {
  const heartbeat = useSession((s) => s.heartbeat);
  useEffect(() => {
    if (!active) return;
    heartbeat();
    const id = window.setInterval(heartbeat, 5000);
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request("screen").then((l) => (lock = l)).catch(() => {});
    return () => {
      window.clearInterval(id);
      lock?.release().catch(() => {});
    };
  }, [active, heartbeat]);
}

/** Controls appear on movement and withdraw after 3 s of stillness. */
export function useIdle(ms = 3000) {
  const [awake, setAwake] = useState(true);
  const t = useRef<number | undefined>(undefined);
  const poke = () => {
    setAwake(true);
    window.clearTimeout(t.current);
    t.current = window.setTimeout(() => setAwake(false), ms);
  };
  useEffect(() => {
    poke();
    const on = () => poke();
    window.addEventListener("pointermove", on);
    return () => {
      window.removeEventListener("pointermove", on);
      window.clearTimeout(t.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return { awake, poke };
}
