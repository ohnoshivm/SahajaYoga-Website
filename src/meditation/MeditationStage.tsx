"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { chakraBySlug } from "@/chakras/registry";
import { Mandala } from "@/chakras/Mandala";
import * as C from "@/session/counter";
import * as T from "@/session/timer";
import { PHASE_COPY } from "@/session/routines";
import { useSession, type VisualMode } from "@/session/sessionStore";
import { LapSeeds } from "./LapSeeds";
import { pulse, softBell, usePrefs } from "./prefs";

const HeroScene = dynamic(() => import("@/scene/HeroScene").then((m) => m.HeroScene), { ssr: false });
const VishuddhiForm = dynamic(() => import("@/scene/chakras/VishuddhiScene").then((m) => m.VishuddhiScene), {
  ssr: false,
});

const IGNORE = "button, a, input, select, textarea, [data-no-count]";

function useNow(active: boolean) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, [active]);
  return now;
}

/**
 * The meditation space ("Altar" layout): one anchor object, a monumental timer behind it,
 * ten lap seeds beneath, and the entire screen as the counting surface.
 */
export function MeditationStage({ onFinished }: { onFinished: (id: string) => void }) {
  const session = useSession((s) => s.session);
  const tap = useSession((s) => s.tap);
  const undo = useSession((s) => s.undo);
  const guideStep = useSession((s) => s.guideStep);
  const pause = useSession((s) => s.pause);
  const resume = useSession((s) => s.resume);
  const goToPhase = useSession((s) => s.goToPhase);
  const setMode = useSession((s) => s.setMode);
  const finish = useSession((s) => s.finish);
  const heartbeat = useSession((s) => s.heartbeat);
  const prefs = usePrefs();

  const [controls, setControls] = useState(true);
  const [announce, setAnnounce] = useState("");
  const [roundFlash, setRoundFlash] = useState<number | null>(null);
  const [reduced, setReduced] = useState(false);
  const hideTimer = useRef<number | null>(null);

  const running = session?.status === "in-progress";
  const now = useNow(!!session);

  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  // heartbeat so a closed tab is never counted as meditation
  useEffect(() => {
    if (!session) return;
    heartbeat();
    const id = window.setInterval(heartbeat, 5000);
    const onVis = () => heartbeat();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [session?.id, heartbeat]); // eslint-disable-line react-hooks/exhaustive-deps

  // keep the screen awake while meditating, where supported
  useEffect(() => {
    let lock: { release: () => Promise<void> } | null = null;
    const nav = navigator as Navigator & { wakeLock?: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> } };
    if (running && nav.wakeLock) nav.wakeLock.request("screen").then((l) => (lock = l)).catch(() => {});
    return () => {
      lock?.release().catch(() => {});
    };
  }, [running]);

  const revealControls = useCallback(() => {
    setControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setControls(false), session?.mode === "guided" ? 9000 : 3500);
  }, [session?.mode]);

  useEffect(() => {
    revealControls();
    return () => {
      if (hideTimer.current) window.clearTimeout(hideTimer.current);
    };
  }, [revealControls]);

  const phase = session ? session.phases[session.phaseIndex] : null;
  const isGuide = phase?.kind === "kundalini" || phase?.kind === "bandhan";
  const guideDone = phase && isGuide ? (session!.guideCounts[phase.id] ?? 0) : 0;
  const guideTotal = phase?.steps ?? 0;
  const v = session ? C.view(session.counter) : null;

  const count = useCallback(() => {
    const s = useSession.getState().session;
    if (!s || s.status !== "in-progress") return;
    const ph = s.phases[s.phaseIndex];
    if (ph.kind === "kundalini" || ph.kind === "bandhan") {
      guideStep();
      if (prefs.haptics) pulse(10);
      const done = (useSession.getState().session?.guideCounts[ph.id] ?? 0);
      setAnnounce(`${done} of ${ph.steps}`);
      return;
    }
    tap();
    const view = C.view(useSession.getState().session!.counter);
    if (view.roundJustCompleted) {
      setRoundFlash(view.completedRounds);
      setAnnounce(`Round ${view.completedRounds} complete`);
      if (prefs.haptics) pulse([18, 60, 18]);
      if (prefs.bell) softBell();
      window.setTimeout(() => setRoundFlash(null), 2600);
    } else {
      if (prefs.haptics) pulse(8);
      setAnnounce(`Lap ${view.displayLap}`);
    }
  }, [guideStep, tap, prefs.haptics, prefs.bell]);

  // keyboard: Space / Enter count, Backspace undo, P pause, Escape shows controls
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target;
      if (t instanceof Element && t.closest("input, textarea, select")) return;
      if ((e.code === "Space" || e.code === "Enter") && !(t instanceof Element && t.closest("button, a"))) {
        e.preventDefault();
        if (!e.repeat) count();
      } else if (e.code === "Backspace") {
        undo();
        revealControls();
      } else if (e.key === "p" || e.key === "P") {
        const s = useSession.getState().session;
        if (s?.status === "paused") resume();
        else pause();
        revealControls();
      } else if (e.key === "Escape") {
        revealControls();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count, undo, pause, resume, revealControls]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (!e.isPrimary) return; // a second finger never double-counts
    if (e.target instanceof Element && e.target.closest(IGNORE)) return;
    count();
  };

  if (!session || !phase || !v) return null;

  const chakra = phase.chakra ? chakraBySlug(phase.chakra) : undefined;
  const elapsedMs = T.elapsed(session.timer, now);
  const mode: VisualMode = session.mode;
  const copy = PHASE_COPY[phase.kind];
  const last = session.phaseIndex === session.phases.length - 1;
  const canAdvance = !isGuide || guideDone >= guideTotal;

  const end = () => {
    const id = finish(last ? "complete" : "ended-early");
    if (id) onFinished(id);
  };

  return (
    <div
      className="stage room"
      data-mode={mode}
      data-world={chakra?.slug}
      data-controls={controls}
      data-paused={!running}
      onPointerDown={onPointerDown}
      onPointerMove={revealControls}
    >
      <p className="sr-only" role="status" aria-live="polite">
        {announce}
      </p>

      <header className="stage__meta" data-no-count>
        <div>
          <p className="stage__phase">{copy.title}{chakra ? ` · ${chakra.name}` : ""}</p>
          <p className="stage__step tabular">
            {session.phaseIndex + 1} of {session.phases.length} · {session.routineName}
          </p>
        </div>
        {!isGuide && prefs.showCount && (
          <div className="stage__round tabular" aria-hidden="true">
            <span className="stage__round-n">Round {v.displayRound}</span>
            <span className="stage__round-of">
              {v.roundJustCompleted ? "complete" : `${v.displayLap} of ${session.counter.roundSize}`}
            </span>
          </div>
        )}
      </header>

      <div className="stage__altar" aria-hidden="true">
        <div className="stage__timer tabular">{T.formatClock(elapsedMs)}</div>
        <div className="stage__anchor">
          {chakra?.slug === "vishuddhi" ? (
            <VishuddhiForm still={reduced || mode !== "guided"} />
          ) : chakra ? (
            <div className="stage__mandala">
              <Mandala form={chakra.form} />
            </div>
          ) : (
            <HeroScene reducedMotion={reduced || mode !== "guided"} variant="return" />
          )}
        </div>
        <div className="stage__seeds">
          {isGuide ? (
            <LapSeeds total={guideTotal} lit={guideDone} complete={guideDone >= guideTotal} />
          ) : (
            <LapSeeds total={session.counter.roundSize} lit={v.currentLap} complete={v.roundJustCompleted} />
          )}
          <p className="stage__flash" data-on={roundFlash !== null}>
            {roundFlash !== null ? `Round ${roundFlash} complete` : ""}
          </p>
        </div>
      </div>

      {mode === "guided" && (
        <div className="stage__guide" data-no-count>
          {copy.guide.map((g) => (
            <p key={g}>{g}</p>
          ))}
          {isGuide && (
            <p className="stage__guide-count tabular">
              {guideDone} of {guideTotal}
            </p>
          )}
        </div>
      )}

      {!running && (
        <div className="stage__paused" data-no-count>
          <p>{session.recovered ? "Welcome back. Your session was paused while you were away." : "Paused"}</p>
          <button type="button" className="pill" onClick={resume}>
            Resume
          </button>
        </div>
      )}

      <nav className="stage__bar" aria-label="Session controls" data-no-count>
        <button type="button" className="bar-btn" onClick={undo} disabled={isGuide || v.totalTaps === 0}>
          Undo
        </button>
        <button type="button" className="bar-btn" onClick={() => (running ? pause() : resume())}>
          {running ? "Pause" : "Resume"}
        </button>
        <div className="bar-modes" role="radiogroup" aria-label="Screen">
          {(["guided", "immersive", "silent"] as VisualMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={mode === m}
              className="bar-mode"
              onClick={() => setMode(m)}
            >
              {m === "guided" ? "Guided" : m === "immersive" ? "Immersive" : "Silent"}
            </button>
          ))}
        </div>
        <button
          type="button"
          className="bar-btn"
          onClick={() => prefs.set({ haptics: !prefs.haptics })}
          aria-pressed={prefs.haptics}
        >
          Haptics {prefs.haptics ? "on" : "off"}
        </button>
        <button type="button" className="bar-btn" onClick={() => prefs.set({ bell: !prefs.bell })} aria-pressed={prefs.bell}>
          Bell {prefs.bell ? "on" : "off"}
        </button>
        {!last ? (
          <button type="button" className="bar-btn bar-btn--primary" onClick={() => goToPhase(session.phaseIndex + 1)}>
            {canAdvance ? "Next" : "Skip"} <span aria-hidden="true">→</span>
          </button>
        ) : null}
        <button type="button" className="bar-btn bar-btn--primary" onClick={end}>
          Finish
        </button>
      </nav>

      <p className="stage__hint" aria-hidden="true">
        {isGuide ? "Tap anywhere for each repetition" : "Tap anywhere to count · Space or Enter"}
      </p>
    </div>
  );
}
