"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { restoreBloom, useBloom } from "./bloomStore";

const HeroScene = dynamic(() => import("@/scene/HeroScene").then((m) => m.HeroScene), {
  ssr: false,
  loading: () => null,
});

const INTERACTIVE = "a, button, input, textarea, select, [role='button'], [data-no-hold]";

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

export function Hero() {
  const reducedMotion = usePrefersReducedMotion();
  const holding = useBloom((s) => s.holding);
  const bloomed = useBloom((s) => s.bloomed);
  const setHolding = useBloom((s) => s.setHolding);
  const setAgitation = useBloom((s) => s.setAgitation);
  const completeBloom = useBloom((s) => s.completeBloom);
  const lastPointer = useRef<{ x: number; y: number; t: number } | null>(null);
  const [webgl, setWebgl] = useState(true);

  useEffect(() => {
    restoreBloom();
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setWebgl(false);
    }
  }, []);

  // Space bar holds (unless focus is on a control that owns Space)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;
      const target = e.target;
      if (target instanceof Element && target.closest(INTERACTIVE)) return;
      if (useBloom.getState().bloomed) return;
      e.preventDefault();
      setHolding(true);
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") setHolding(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", () => setHolding(false));
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [setHolding]);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return;
      if (e.target instanceof Element && e.target.closest(INTERACTIVE)) return;
      lastPointer.current = { x: e.clientX, y: e.clientY, t: performance.now() };
      setHolding(true);
    },
    [setHolding],
  );

  const release = useCallback(() => {
    setHolding(false);
    setAgitation(0);
  }, [setHolding, setAgitation]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!useBloom.getState().holding || !lastPointer.current) return;
      const now = performance.now();
      const dt = Math.max(16, now - lastPointer.current.t);
      const speed = Math.hypot(e.clientX - lastPointer.current.x, e.clientY - lastPointer.current.y) / dt; // px/ms
      lastPointer.current = { x: e.clientX, y: e.clientY, t: now };
      setAgitation(Math.min(1, speed / 1.2));
    },
    [setAgitation],
  );

  useEffect(() => {
    window.addEventListener("pointerup", release);
    window.addEventListener("pointercancel", release);
    return () => {
      window.removeEventListener("pointerup", release);
      window.removeEventListener("pointercancel", release);
    };
  }, [release]);

  return (
    <section
      className="hero room"
      aria-labelledby="hero-title"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      data-holding={holding}
      data-bloomed={bloomed}
    >
      <div className="hero__stage">
        <h1 id="hero-title" className="hero__title" aria-label="Sahaja Yoga">
          <span className="hero__line hero__line--1" aria-hidden="true">
            SAHAJA
          </span>
          <span className="hero__line hero__line--2" aria-hidden="true">
            YOGA
          </span>
        </h1>

        <div className="hero__object" aria-hidden="true">
          {webgl ? <HeroScene reducedMotion={reducedMotion} /> : <div className="hero__object-fallback" />}
        </div>
      </div>

      <p className="hero__subline">A space to return to yourself.</p>

      <div className="hero__foot">
        <p className="hold-cue" aria-hidden={bloomed} data-visible={!bloomed && !holding}>
          <span className="hold-cue__ring" aria-hidden="true" />
          {reducedMotion ? "Tap to bloom" : "Hold to bloom"}
          <kbd className="hold-cue__key">Space</kbd>
        </p>
        {/* screen-reader and keyboard path: a real button that opens the lotus at once */}
        <button type="button" className="sr-only" onClick={() => completeBloom(reducedMotion)} disabled={bloomed}>
          Open the lotus
        </button>
        <p className="sr-only" role="status" aria-live="polite">
          {bloomed ? "The lotus has opened." : ""}
        </p>

        <nav className="hero__actions" aria-label="Get started">
          <Link href="/meditate" className="text-action text-action--primary">
            Begin Meditation
          </Link>
          <Link href="/chakras" className="text-action text-action--secondary">
            Explore Chakras <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </section>
  );
}
