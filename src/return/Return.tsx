"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const HeroScene = dynamic(() => import("@/scene/HeroScene").then((m) => m.HeroScene), { ssr: false });

/** The light returns to the lotus: the close of the homepage journey. */
export function Return() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    setReduced(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { rootMargin: "200px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section ref={ref} className="return room" aria-labelledby="return-title">
      <div className="return__object" aria-hidden="true">
        {visible && <HeroScene reducedMotion={reduced} variant="return" />}
      </div>
      <div className="return__copy">
        <p className="return__label">Sahasrara</p>
        <h2 id="return-title" className="return__title">
          Return to yourself.
        </h2>
        <p className="return__line">A quiet chair, open palms, ten minutes. Everything you need is already within you.</p>
        <nav className="return__actions" aria-label="Begin">
          <Link href="/meditate" className="text-action text-action--primary">
            Begin Meditation
          </Link>
          <Link href="/practice" className="text-action text-action--secondary">
            Continue my practice <span aria-hidden="true">→</span>
          </Link>
        </nav>
      </div>
    </section>
  );
}
