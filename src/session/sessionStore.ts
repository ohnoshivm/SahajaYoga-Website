"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import * as C from "./counter";
import * as T from "./timer";
import { routineById, type Phase } from "./routines";
import { saveRecord, type SessionRecord } from "./history";

export type VisualMode = "guided" | "immersive" | "silent";

export type ActiveSession = {
  id: string;
  routineId: string;
  routineName: string;
  phases: Phase[];
  phaseIndex: number;
  /** progress through guided gestures (Kundalini knots, Bandhan arcs) per phase id */
  guideCounts: Record<string, number>;
  status: "in-progress" | "paused";
  startedAtWall: number;
  timer: T.TimerState;
  counter: C.CounterState;
  mode: VisualMode;
  /** heartbeat: last wall-clock moment the session screen was alive */
  lastSeenWall: number;
  /** set when a session is recovered after the page was closed */
  recovered?: boolean;
};

type Store = {
  session: ActiveSession | null;
  lastSavedId: string | null;
  begin: (routineId: string, opts?: { chakra?: Phase["chakra"]; mode?: VisualMode }) => void;
  tap: () => void;
  undo: () => void;
  guideStep: () => void;
  pause: () => void;
  resume: () => void;
  goToPhase: (index: number) => void;
  setMode: (mode: VisualMode) => void;
  resetCounter: () => void;
  finish: (status?: SessionRecord["status"]) => string | null;
  discard: () => void;
  heartbeat: () => void;
  recover: () => void;
  acknowledgeRecovery: () => void;
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useSession = create<Store>()(
  persist(
    (set, get) => ({
      session: null,
      lastSavedId: null,

      begin: (routineId, opts) => {
        const routine = routineById(routineId);
        const now = Date.now();
        const phases = routine.phases.map((p) => (p.kind === "chakra" && opts?.chakra ? { ...p, chakra: opts.chakra } : p));
        set({
          session: {
            id: uid(),
            routineId: routine.id,
            routineName: routine.name,
            phases,
            phaseIndex: 0,
            guideCounts: {},
            status: "in-progress",
            startedAtWall: now,
            timer: T.start(T.createTimer(), now),
            counter: C.createCounter(now),
            mode: opts?.mode ?? "guided",
            lastSeenWall: now,
          },
        });
      },

      tap: () => {
        const s = get().session;
        if (!s || s.status !== "in-progress") return;
        set({ session: { ...s, counter: C.tap(s.counter, Date.now()) } });
      },

      undo: () => {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, counter: C.undo(s.counter) } });
      },

      guideStep: () => {
        const s = get().session;
        if (!s || s.status !== "in-progress") return;
        const phase = s.phases[s.phaseIndex];
        const steps = phase.steps ?? 1;
        const current = s.guideCounts[phase.id] ?? 0;
        if (current >= steps) return;
        set({ session: { ...s, guideCounts: { ...s.guideCounts, [phase.id]: current + 1 } } });
      },

      pause: () => {
        const s = get().session;
        if (!s || s.status === "paused") return;
        set({ session: { ...s, status: "paused", timer: T.pause(s.timer, Date.now()) } });
      },

      resume: () => {
        const s = get().session;
        if (!s || s.status === "in-progress") return;
        set({ session: { ...s, status: "in-progress", timer: T.start(s.timer, Date.now()) } });
      },

      goToPhase: (index) => {
        const s = get().session;
        if (!s) return;
        const i = Math.max(0, Math.min(s.phases.length - 1, index));
        set({ session: { ...s, phaseIndex: i } });
      },

      setMode: (mode) => {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, mode } });
      },

      resetCounter: () => {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, counter: C.reset(s.counter, Date.now()) } });
      },

      finish: (status = "complete") => {
        const s = get().session;
        if (!s) return null;
        const now = Date.now();
        const v = C.view(s.counter);
        const record: SessionRecord = {
          id: s.id,
          routineId: s.routineId,
          routineName: s.routineName,
          startedAt: s.startedAtWall,
          endedAt: now,
          activeMs: T.elapsed(s.timer, now),
          chakras: Array.from(new Set(s.phases.filter((p) => p.chakra).map((p) => p.chakra as string))),
          totalTaps: v.totalTaps,
          rounds: v.completedRounds,
          incompleteRoundTaps: v.incompleteRoundTaps,
          averageLapMs: C.averageLapMs(s.counter),
          status,
        };
        saveRecord(record); // idempotent by id
        set({ session: null, lastSavedId: s.id });
        return s.id;
      },

      discard: () => set({ session: null }),

      heartbeat: () => {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, lastSeenWall: Date.now() } });
      },

      // After a reload or a closed tab, time away is never counted as meditation:
      // the timer is paused at the last heartbeat and the user chooses Resume or End.
      recover: () => {
        const s = get().session;
        if (!s) return;
        const gap = Date.now() - s.lastSeenWall;
        if (s.status === "in-progress" && gap > 15_000) {
          set({ session: { ...s, status: "paused", timer: T.pause(s.timer, s.lastSeenWall), recovered: true } });
        } else if (gap > 15_000) {
          set({ session: { ...s, recovered: true } });
        }
      },

      acknowledgeRecovery: () => {
        const s = get().session;
        if (!s) return;
        set({ session: { ...s, recovered: false } });
      },
    }),
    {
      name: "sy.session.v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ session: state.session, lastSavedId: state.lastSavedId }),
    },
  ),
);
