"use client";

import { useEffect, useRef } from "react";

/**
 * Ten seeds of a mala: one per mantra, one round per arc. A tapped seed springs
 * (scale 1.3 → 1); the tenth closes the round with one slow wave across all ten.
 */
export function Seeds({
  lit,
  n = 10,
  kind = "arc",
  width,
  height,
  r = 1300,
  span = 30,
  size = 7,
  halo = true,
  complete = false,
  className = "",
  style,
}: {
  lit: number;
  n?: number;
  kind?: "arc" | "ring" | "row";
  width: number;
  height: number;
  r?: number;
  span?: number;
  size?: number;
  halo?: boolean;
  complete?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const pts: [number, number][] = [];
  if (kind === "row") {
    const gap = (width - size * 4) / (n - 1);
    for (let i = 0; i < n; i++) pts.push([size * 2 + i * gap, height / 2]);
  } else {
    const sp = (span * Math.PI) / 180, cx = width / 2, cy = kind === "ring" ? height / 2 : height / 2 - r;
    for (let i = 0; i < n; i++) {
      const a = kind === "ring" ? -Math.PI / 2 + (i / n) * Math.PI * 2 : Math.PI / 2 + sp / 2 - (i / (n - 1)) * sp;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
  }
  const prev = useRef(lit);
  const svg = useRef<SVGSVGElement>(null);
  useEffect(() => {
    // spring the newly lit seed
    if (lit > prev.current && svg.current) {
      const el = svg.current.querySelector<SVGCircleElement>(`[data-i="${lit - 1}"]`);
      el?.animate([{ transform: "scale(1.35)" }, { transform: "scale(0.94)" }, { transform: "scale(1)" }], { duration: 380, easing: "cubic-bezier(.16,1,.3,1)" });
    }
    prev.current = lit;
  }, [lit]);

  return (
    <svg ref={svg} className={`seeds ${className}`} viewBox={`0 0 ${width} ${height}`} data-complete={complete} style={style} aria-hidden="true">
      {pts.map(([x, y], i) => (
        <circle
          key={i}
          data-i={i}
          cx={x}
          cy={y}
          r={size}
          className={i < lit ? "seed seed--on" : "seed"}
          style={{ transformOrigin: `${x}px ${y}px`, transformBox: "view-box", transitionDelay: complete ? `${i * 60}ms` : undefined }}
        />
      ))}
      {halo && lit > 0 && !complete && <circle cx={pts[lit - 1][0]} cy={pts[lit - 1][1]} r={size * 2.3} className="seed-halo" />}
    </svg>
  );
}
