"use client";

import dynamic from "next/dynamic";
import { forwardRef, useEffect, useRef, useState } from "react";
import type { LotusLive } from "@/scene/LotusCanvas";

const LotusCanvas = dynamic(() => import("@/scene/LotusCanvas"), { ssr: false });

export function useWebGL() {
  const [ok, setOk] = useState<boolean | null>(null);
  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      setOk(!reduced && !!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch {
      setOk(false);
    }
  }, []);
  return ok;
}

/** Pauses rendering while off screen. */
export function useOnScreen<T extends Element>(ref: React.RefObject<T | null>) {
  const [on, setOn] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOn(e.isIntersecting), { rootMargin: "120px" });
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return on;
}

type Props = { className?: string; style?: React.CSSProperties; live?: React.RefObject<LotusLive>; still?: boolean };

/** The approved lotus. A still image paints first (fast, and the fallback); the 3D surface fades in over it. */
export const Lotus = forwardRef<HTMLDivElement, Props>(function Lotus({ className = "", style, live, still }, ref) {
  const inner = useRef<HTMLDivElement>(null);
  const fallbackLive = useRef<LotusLive>({ glow: 0, bright: 1, tiltScale: 1 });
  const webgl = useWebGL();
  const on = useOnScreen(inner);
  const [ready, setReady] = useState(false);
  const use3D = webgl && !still;

  return (
    <div ref={ref} className={`lotus-wrap ${className}`} style={style} aria-hidden="true">
      <div ref={inner} style={{ position: "relative", width: "100%", height: "100%" }} className="lotus-img">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/lotus.png" alt="" draggable={false} style={{ opacity: use3D && ready ? 0 : 1, transition: "opacity 400ms" }} fetchPriority="high" />
        {use3D && <LotusCanvas live={live ?? fallbackLive} active={on} onReady={() => setReady(true)} />}
      </div>
    </div>
  );
});
