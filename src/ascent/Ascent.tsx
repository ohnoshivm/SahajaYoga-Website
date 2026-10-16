"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CHAKRAS, type WorldTheme } from "@/chakras/registry";
import { Mandala } from "@/chakras/Mandala";
import { HandMap } from "@/chakras/HandMap";
import { KundaliniMark } from "./KundaliniMark";

/** The ivory room the Ascent starts from, so the hero hands over seamlessly. */
const ROOT_THEME: WorldTheme = { env: "#e7d9cb", envHi: "#efe6db", glow: "#b8925f", ink: "#3e3531", soft: "#5c4e43" };
const THEMES: WorldTheme[] = [ROOT_THEME, ...CHAKRAS.map((c) => c.theme)];
const STEPS = THEMES.length - 1; // intro (0) + 7 chakras

function hexToRgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function mix(a: string, b: string, t: number) {
  const A = hexToRgb(a);
  const B = hexToRgb(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(" ")})`;
}
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

function useMotionAllowed() {
  const [allowed, setAllowed] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setAllowed(!mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return allowed;
}

export function Ascent() {
  const motion = useMotionAllowed();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const light = useRef<HTMLDivElement>(null);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const forms = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    if (!motion || !section.current) return;
    let cleanup = () => {};
    let cancelled = false;

    (async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      const apply = (progress: number) => {
        const f = progress * STEPS;
        const i = Math.min(STEPS - 1, Math.floor(f));
        const t = f - i;
        const a = THEMES[i];
        const b = THEMES[i + 1];
        // ease the colour change into the middle of the passage between chakras
        const ct = clamp01((t - 0.35) / 0.3);
        const st = stage.current!.style;
        st.setProperty("--a-env", mix(a.env, b.env, ct));
        st.setProperty("--a-env-hi", mix(a.envHi, b.envHi, ct));
        st.setProperty("--a-glow", mix(a.glow, b.glow, ct));
        st.setProperty("--a-ink", mix(a.ink, b.ink, ct));
        st.setProperty("--a-soft", mix(a.soft, b.soft, ct));

        panels.current.forEach((el, k) => {
          if (!el) return;
          const d = f - k;
          const o = clamp01(1 - Math.abs(d) * 2.2);
          el.style.opacity = String(o);
          el.style.transform = `translate3d(0, ${(-d * 6).toFixed(2)}vh, 0)`;
          el.style.visibility = o < 0.01 ? "hidden" : "visible";
          el.dataset.active = String(Math.abs(d) < 0.5);
        });
        forms.current.forEach((el, k) => {
          if (!el) return;
          const d = f - k;
          el.style.transform = `rotate(${(d * 24).toFixed(2)}deg) scale(${(1 - Math.min(0.12, Math.abs(d) * 0.18)).toFixed(3)})`;
        });

        // the light passes through each chakra at the centre of its chapter
        const g = f + 0.5;
        const frac = g - Math.floor(g);
        const h = stage.current!.clientHeight;
        if (light.current) {
          light.current.style.transform = `translate3d(-50%, ${((0.5 - frac) * h * 0.92).toFixed(1)}px, 0)`;
          light.current.style.opacity = String(f < 0.15 ? f / 0.15 : f > STEPS - 0.3 ? clamp01((STEPS - f) / 0.3) : 1);
        }
      };

      const trigger = ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.9,
        onUpdate: (self) => apply(self.progress),
        onRefresh: (self) => apply(self.progress),
      });
      apply(0);
      cleanup = () => trigger.kill();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [motion]);

  /** Keyboard users: focusing a link in a chapter scrolls that chapter into view. */
  const focusChapter = (k: number) => {
    if (!motion || !section.current) return;
    const el = section.current;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (k / STEPS) * travel, behavior: "auto" });
  };

  return (
    <section
      ref={section}
      className={`ascent ${motion ? "ascent--motion" : "ascent--static"}`}
      aria-labelledby="ascent-title"
      style={motion ? { height: `${(STEPS + 1) * 100}svh` } : undefined}
    >
      <div ref={stage} className="ascent__stage">
        {motion && (
          <div className="ascent__channels" aria-hidden="true">
            <span className="ascent__channel ascent__channel--ida" />
            <span className="ascent__channel ascent__channel--sushumna" />
            <span className="ascent__channel ascent__channel--pingala" />
            <div ref={light} className="ascent__light" />
          </div>
        )}

        {/* 0 · the root */}
        <article
          ref={(el) => {
            panels.current[0] = el;
          }}
          className="ascent__panel ascent__panel--intro"
          style={motion ? undefined : themeStyle(ROOT_THEME)}
        >
          <p className="ascent__label">The subtle system</p>
          <h2 id="ascent-title" className="ascent__intro-title">
            It begins at the root.
          </h2>
          <p className="ascent__intro-line">
            A gentle, motherly energy, the Kundalini, rests in the sacrum bone. In meditation, she rises.
          </p>
          <div
            className="ascent__kundalini"
            ref={(el) => {
              forms.current[0] = el;
            }}
          >
            <KundaliniMark />
          </div>
          <dl className="ascent__legend">
            <div>
              <dt>Ida</dt>
              <dd>left · the past</dd>
            </div>
            <div>
              <dt>Sushumna</dt>
              <dd>centre · the present</dd>
            </div>
            <div>
              <dt>Pingala</dt>
              <dd>right · the future</dd>
            </div>
          </dl>
        </article>

        {CHAKRAS.map((c, idx) => {
          const k = idx + 1;
          return (
            <article
              key={c.slug}
              ref={(el) => {
                panels.current[k] = el;
              }}
              className="ascent__panel"
              aria-labelledby={`ascent-${c.slug}`}
              style={motion ? undefined : themeStyle(c.theme)}
            >
              <header className="ascent__head">
                <p className="ascent__index tabular">
                  {String(c.n).padStart(2, "0")} <span aria-hidden="true">/</span> 07
                </p>
                <p className="ascent__name">
                  {c.name} · {c.element}
                </p>
                <h3 id={`ascent-${c.slug}`} className="ascent__quality">
                  {c.quality}
                </h3>
              </header>

              <div
                className="ascent__form"
                ref={(el) => {
                  forms.current[k] = el;
                }}
              >
                <Mandala form={c.form} title={`${c.name} chakra`} />
              </div>

              <div className="ascent__aside">
                <p className="ascent__line">{c.line}</p>
                <HandMap finger={c.finger} label={c.fingerLabel} />
                <Link href={`/chakras/${c.slug}`} className="ascent__enter" onFocus={() => focusChapter(k)}>
                  Enter {c.name} <span aria-hidden="true">→</span>
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function themeStyle(t: WorldTheme): React.CSSProperties {
  return {
    ["--a-env" as string]: t.env,
    ["--a-env-hi" as string]: t.envHi,
    ["--a-glow" as string]: t.glow,
    ["--a-ink" as string]: t.ink,
    ["--a-soft" as string]: t.soft,
  };
}
