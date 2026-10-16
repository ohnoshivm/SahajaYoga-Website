"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Lotus } from "@/ui/Lotus";
import { ArrowDown } from "@/ui/LotusMark";
import type { LotusLive } from "@/scene/LotusCanvas";

const HOLD_SECONDS = 4;
const v = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).map(([k, n]) => [`--${k}`, n])) as React.CSSProperties;

function Letters({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <span key={i} className="mask">
          <span className="ltr">{ch}</span>
        </span>
      ))}
    </>
  );
}

export function Hero({ onBloomed }: { onBloomed?: () => void }) {
  const root = useRef<HTMLElement>(null);
  const lotusRef = useRef<HTMLDivElement>(null);
  const live = useRef<LotusLive>({ glow: 0, bright: 1, tiltScale: 1 });
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [ring, setRing] = useState<{ x: number; y: number } | null>(null);
  const p = useRef(0);
  const hold = useRef(false);
  const done = useRef(false);

  // arrival: letters rise out of their masks, then the lotus settles and its heart warms
  useEffect(() => {
    const el = root.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      tl.from(".hero__sahaja .ltr", { yPercent: 105, duration: 1.3, stagger: 0.06 })
        .from(".hero__yoga .ltr", { yPercent: 105, duration: 1.2, stagger: 0.06 }, 0.35)
        .from(".hero__lotus-in", { y: 46, scale: 0.94, opacity: 0, filter: "blur(10px)", duration: 1.8 }, 0.25)
        .from(".hero__fade", { opacity: 0, y: 12, duration: 1.1, stagger: 0.08 }, 1.0)
        .fromTo(live.current, { glow: 0.7 }, { glow: 0, duration: 1.6, ease: "sine.inOut" }, 1.2);
    }, el);
    return () => ctx.revert();
  }, []);

  // hold-to-bloom: reversible at the same pace; completing it carries you into the Ascent
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const before = p.current;
      p.current = hold.current ? Math.min(1, p.current + dt / HOLD_SECONDS) : Math.max(0, p.current - dt / HOLD_SECONDS);
      if (p.current !== before) {
        setProgress(p.current);
        live.current.glow = p.current * 1.15;
        live.current.bright = 1 + p.current * 0.05;
      }
      if (p.current >= 1 && !done.current) {
        done.current = true;
        hold.current = false;
        setHolding(false);
        window.setTimeout(() => {
          onBloomed?.();
          done.current = false;
        }, 700);
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onBloomed]);

  const start = (x?: number, y?: number) => {
    hold.current = true;
    setHolding(true);
    if (x !== undefined && y !== undefined) setRing({ x, y });
  };
  const stop = () => {
    hold.current = false;
    setHolding(false);
  };

  useEffect(() => {
    const up = () => stop();
    window.addEventListener("pointerup", up);
    window.addEventListener("pointercancel", up);
    window.addEventListener("blur", up);
    return () => {
      window.removeEventListener("pointerup", up);
      window.removeEventListener("pointercancel", up);
      window.removeEventListener("blur", up);
    };
  }, []);

  const lift = progress;
  return (
    <section ref={root} className="stage hero" aria-labelledby="hero-title" style={{ ["--p" as string]: lift }}>
      <h1 id="hero-title" className="hero__title">
        <span className="display pos hero__sahaja" style={v({ x: 84, y: 206, fs: 346, px: 18, py: 138, pfs: 96 })}>
          <Letters text="SAHAJA" />
        </span>{" "}
        <span className="display pos hero__yoga" style={v({ x: 92, y: 520, fs: 166, px: 107, py: 446, pfs: 92 })}>
          <Letters text="YOGA" />
        </span>
      </h1>

      <div className="heart-glow pos hero__glow" style={v({ x: 380, y: 200, w: 680, px: 0, py: 150, pw: 390 })} />
      <div className="pos hero__lotus" style={{ ...v({ x: 408, y: 300, w: 624, px: 4, py: 214, pw: 382 }), transform: `translateY(${-lift * 1.2}%) scale(${1 + lift * 0.035})` }}>
        <Lotus ref={lotusRef} live={live} className="hero__lotus-in" />
      </div>
      <button
        type="button"
        className="pos hero__hold"
        style={v({ x: 470, y: 330, w: 500, px: 30, py: 230, pw: 330 })}
        aria-label="Open the lotus: press and hold"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture?.(e.pointerId);
          start(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => setRing({ x: e.clientX, y: e.clientY })}
        onPointerLeave={() => !hold.current && setRing(null)}
        onKeyDown={(e) => {
          if ((e.key === " " || e.key === "Enter") && !e.repeat) {
            e.preventDefault();
            start();
          }
        }}
        onKeyUp={(e) => (e.key === " " || e.key === "Enter") && stop()}
      />
      <div className="hero__breeze" aria-hidden="true" style={{ opacity: Math.min(1, lift * 1.6) }} data-on={holding}>
        {Array.from({ length: 16 }, (_, i) => (
          <i key={i} style={{ left: `${40 + ((i * 37) % 21)}%`, animationDelay: `${(i * 0.37) % 3}s`, animationDuration: `${3.2 + (i % 5) * 0.5}s` }} />
        ))}
      </div>
      {ring && (
        <svg className="hero__ring" style={{ left: ring.x, top: ring.y }} width="92" height="92" viewBox="0 0 92 92" aria-hidden="true">
          <circle cx="46" cy="46" r="40" fill="rgba(246,240,232,.35)" stroke="rgba(62,53,49,.25)" strokeWidth="1" />
          <circle cx="46" cy="46" r="40" fill="none" stroke="#b8925f" strokeWidth="2" strokeDasharray="251.3" strokeDashoffset={251.3 * (1 - lift)} transform="rotate(-90 46 46)" strokeLinecap="round" />
          <text x="46" y="51" textAnchor="middle" fontFamily="var(--sans)" fontSize="12.5" letterSpacing="1.4" fill="#3e3531">
            HOLD
          </text>
        </svg>
      )}

      <p className="lead pos hero__fade hero__sub" style={v({ x: 984, y: 606, w: 360, px: 24, py: 562, pw: 342 })}>
        A space to return to yourself.
      </p>

      <div className="pos pos--row hero__ctas" style={v({ x: 0, y: 776, px: 0, py: 676 })} data-hide={lift > 0.04}>
        <div className="hero__ctas-in hero__fade">
          <Link href="/meditate" className="text-action hero__begin">
            Begin Meditation
          </Link>
          <Link href="/chakras" className="text-action text-action--soft">
            Explore Chakras
          </Link>
        </div>
      </div>
      <div className="pos pos--row hero__holdcopy" style={v({ x: 0, y: 770, px: 0, py: 690 })} data-show={lift > 0.04} aria-live="polite">
        <p className="hero__breathe">{lift >= 1 ? "Open." : "Breathe out. Let it open."}</p>
        <p className="hero__release">Release at any time and it gently closes again.</p>
      </div>
      <a href="#ascent" className="pos hero__arrow hero__fade desk-only" style={v({ x: 709, y: 834 })} aria-label="Scroll to the seven chakras">
        <ArrowDown />
      </a>
    </section>
  );
}
