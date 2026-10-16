"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CHAKRAS, ascentLine, worldVars } from "@/chakras/registry";
import { rememberOrigin } from "@/world/ChakraWorld";

gsap.registerPlugin(ScrollTrigger);

const v = (o: Record<string, number>) => Object.fromEntries(Object.entries(o).map(([k, n]) => [`--${k}`, n])) as React.CSSProperties;
// form placement per chakra in the 1440 × 900 frame (from the approved frames)
const FORM: Record<string, { x: number; y: number; w: number }> = {
  mooladhara: { x: 470, y: 240, w: 500 },
  sahasrara: { x: 430, y: 210, w: 580 },
};
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export function Ascent() {
  const root = useRef<HTMLElement>(null);
  const [reduced, setReduced] = useState(false);
  const [active, setActive] = useState(0);

  useEffect(() => setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches), []);

  useEffect(() => {
    const el = root.current;
    if (!el || reduced) return;
    const q = <T extends Element>(s: string) => Array.from(el.querySelectorAll<T>(s));
    const bgs = q<HTMLElement>(".as__bg"), names = q<HTMLElement>(".as__name"), forms = q<HTMLElement>(".as__form"), texts = q<HTMLElement>(".as__text");
    const line = el.querySelector<HTMLElement>(".as__kundalini");
    let last = -1;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.8,
      onUpdate: (self) => {
        const t = self.progress * 6.999;
        const a = Math.floor(t), f = t - a, m = a < 6 ? smooth(0.55, 1, f) : 0;
        bgs.forEach((b, i) => (b.style.clipPath = i <= a ? "inset(0)" : i === a + 1 ? `inset(${(1 - m) * 100}% 0 0 0)` : "inset(100% 0 0 0)"));
        names.forEach((n, i) => {
          const o = i === a ? 1 - m : i === a + 1 ? m : 0;
          n.style.opacity = String(o);
          n.style.clipPath = i === a + 1 ? `inset(0 ${(1 - m) * 100}% 0 0)` : "inset(0)";
        });
        forms.forEach((fm, i) => {
          if (i === a) { fm.style.opacity = String(1 - m); fm.style.transform = `translateY(${-m * 26}%) scale(${1 - m * 0.08})`; }
          else if (i === a + 1) { fm.style.opacity = String(m); fm.style.transform = `translateY(${(1 - m) * 30}%) scale(${0.86 + 0.14 * m})`; }
          else { fm.style.opacity = "0"; }
        });
        texts.forEach((x, i) => (x.style.opacity = String(i === a ? 1 - smooth(0.5, 0.8, f) * (a < 6 ? 1 : 0) : i === a + 1 ? smooth(0.85, 1, f) : 0)));
        if (line) line.style.transform = `scaleY(${(a + m) / 6})`;
        const dom = m > 0.5 ? a + 1 : a;
        if (dom !== last) {
          last = dom;
          setActive(dom);
          document.documentElement.style.setProperty("--hd-ink", CHAKRAS[dom].theme.ink);
        }
      },
      onToggle: (self) => {
        if (!self.isActive) document.documentElement.style.removeProperty("--hd-ink");
        else document.documentElement.style.setProperty("--hd-ink", CHAKRAS[Math.max(0, last)].theme.ink);
      },
    });
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => {
      st.kill();
      window.removeEventListener("load", refresh);
      document.documentElement.style.removeProperty("--hd-ink");
    };
  }, [reduced]);

  const jump = (i: number) => {
    const el = root.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const span = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (span * (i + 0.3)) / 6.999, behavior: "smooth" });
  };

  if (reduced) {
    return (
      <section id="ascent" aria-label="The seven chakras">
        {CHAKRAS.map((c) => (
          <div key={c.slug} className="world stage as__static" style={worldVars(c)}>
            <AscentFrame c={c} />
          </div>
        ))}
      </section>
    );
  }

  return (
    <section id="ascent" ref={root} className="as" aria-label="The seven chakras, rising from the base of the spine to the crown">
      <ol className="sr-only">
        {CHAKRAS.map((c) => (
          <li key={c.slug}>
            <Link href={`/chakras/${c.slug}`}>{c.name}: {c.quality}. {ascentLine(c)}</Link>
          </li>
        ))}
      </ol>
      <div className="as__pin">
        {CHAKRAS.map((c, i) => (
          <div key={c.slug} className="world as__bg" style={{ ...worldVars(c), clipPath: i === 0 ? "inset(0)" : "inset(100% 0 0 0)" }} aria-hidden={i !== active} />
        ))}
        {CHAKRAS.map((c, i) => (
          <AscentLayer key={c.slug} c={c} i={i} />
        ))}
        <nav className="as__spine pos-r" style={{ ...v({ x: 1384, y: 300, px: 366, py: 740 }), ...worldVars(CHAKRAS[active]) }} aria-label="Jump to a chakra">
          <span className="as__kundalini" aria-hidden="true" />
          {[...CHAKRAS].reverse().map((c) => (
            <button key={c.slug} type="button" className={c.n - 1 === active ? "now" : c.n - 1 < active ? "past" : ""} onClick={() => jump(c.n - 1)} aria-current={c.n - 1 === active ? "step" : undefined}>
              <span>{c.name}</span>
            </button>
          ))}
        </nav>
        <div className="as__enter pos-r" style={{ ...v({ x: 1344, y: 806, px: 195, py: 780 }), color: CHAKRAS[active].theme.ink }}>
          {active === 6 ? (
            <a href="#return" className="text-action">Return to the room ↓</a>
          ) : (
            <Link href={`/chakras/${CHAKRAS[active].slug}`} className="text-action" onClick={rememberOrigin}>
              Enter {CHAKRAS[active].name} →
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}

function AscentLayer({ c, i }: { c: (typeof CHAKRAS)[number]; i: number }) {
  const f = FORM[c.slug] ?? { x: 450, y: 220, w: 540 };
  return (
    <div className="as__layer" style={worldVars(c)} aria-hidden="true">
      <div className="display pos pos--row as__name" style={{ ...v({ x: 0, y: 214, fs: 214, px: 0, py: 150, pfs: 92 }), opacity: i === 0 ? 1 : 0 }}>
        {c.name}
      </div>
      <div className="as__form pos" style={{ ...v({ x: f.x - 30, y: f.y - 30, w: f.w + 60, px: 10, py: 170, pw: 370 }), opacity: i === 0 ? 1 : 0 }}>
        <div className={c.slug === "sahasrara" ? "heart-glow as__glow" : "form-glow as__glow"} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/assets/chakra-${c.slug}.png`} alt="" className="as__img" loading={i < 2 ? "eager" : "lazy"} />
      </div>
      <div className="as__text pos" style={{ ...v({ x: 96, y: 676, w: 420, px: 24, py: 560, pw: 342 }), opacity: i === 0 ? 1 : 0 }}>
        <h2 className="serif as__quality">{c.quality}</h2>
        <p className="as__line">{ascentLine(c)}</p>
      </div>
    </div>
  );
}

function AscentFrame({ c }: { c: (typeof CHAKRAS)[number] }) {
  return (
    <>
      <AscentLayer c={c} i={0} />
      <div className="as__enter pos-r" style={v({ x: 1344, y: 806, px: 195, py: 780 })}>
        <Link href={`/chakras/${c.slug}`} className="text-action">
          Enter {c.name} →
        </Link>
      </div>
    </>
  );
}
