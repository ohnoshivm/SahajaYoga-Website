import type { ChakraForm } from "./registry";

/**
 * Line-art chakra mandalas drawn from the official Sahaja Yoga USA chakra-guide
 * geometry (petal counts and inner symbols). Monochrome: stroke and fill inherit
 * `currentColor` so each chakra world tints them.
 */

const TAU = Math.PI * 2;

function petalPath(r0: number, r1: number, halfAngle: number) {
  // a pointed lotus petal from radius r0 to tip at r1, centred on angle 0 (pointing up)
  const w = Math.sin(halfAngle) * r0;
  const mid = (r0 + r1) * 0.55;
  return `M ${-w} ${-r0} C ${-w * 1.9} ${-mid}, ${-w * 0.35} ${-r1 * 0.94}, 0 ${-r1} C ${w * 0.35} ${-r1 * 0.94}, ${w * 1.9} ${-mid}, ${w} ${-r0} Z`;
}

function Petals({ count, r0, r1, offset = 0 }: { count: number; r0: number; r1: number; offset?: number }) {
  const half = Math.PI / count;
  const d = petalPath(r0, r1, half * 0.92);
  return (
    <g>
      {Array.from({ length: count }, (_, i) => (
        <path key={i} d={d} transform={`rotate(${((i + offset) / count) * 360})`} className="mandala__petal" />
      ))}
    </g>
  );
}

function triangle(r: number, down = true) {
  const pts = [0, 1, 2].map((k) => {
    const a = (k / 3) * TAU + (down ? Math.PI / 2 : -Math.PI / 2);
    return `${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r).toFixed(2)}`;
  });
  return pts.join(" ");
}

function Star({ r }: { r: number }) {
  return (
    <g className="mandala__line">
      <polygon points={triangle(r, false)} />
      <polygon points={triangle(r, true)} />
    </g>
  );
}

export function Mandala({ form, className = "", title }: { form: ChakraForm; className?: string; title?: string }) {
  return (
    <svg viewBox="-100 -100 200 200" className={`mandala ${className}`} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      {form.kind === "petals-square" && (
        <>
          <Petals count={4} r0={44} r1={92} offset={0.5} />
          <circle r={46} className="mandala__line" />
          <rect x={-31} y={-31} width={62} height={62} className="mandala__line" />
          <polygon points={triangle(30, true)} className="mandala__line mandala__accent" />
        </>
      )}
      {form.kind === "petals-star" && (
        <>
          <Petals count={form.petals} r0={form.petals === 12 ? 50 : 46} r1={92} />
          <circle r={form.petals === 12 ? 52 : 48} className="mandala__line" />
          {form.petals === 6 && <Petals count={6} r0={20} r1={44} offset={0.5} />}
          <Star r={form.petals === 12 ? 44 : 36} />
        </>
      )}
      {form.kind === "petals-triangle" && (
        <>
          <Petals count={10} r0={50} r1={92} />
          <circle r={52} className="mandala__line" />
          <circle r={44} className="mandala__line mandala__faint" />
          <polygon points={triangle(40, true)} className="mandala__line mandala__accent" />
        </>
      )}
      {form.kind === "petals-triangle-rings" && (
        <>
          <Petals count={16} r0={54} r1={93} />
          <circle r={56} className="mandala__line" />
          <polygon points={triangle(50, true)} className="mandala__line" />
          <circle r={21} className="mandala__line mandala__accent" />
          <circle r={13} className="mandala__line" />
        </>
      )}
      {form.kind === "two-petals" && (
        <>
          <path d="M -30 0 C -48 -34, -82 -34, -96 0 C -82 34, -48 34, -30 0 Z" className="mandala__petal" />
          <path d="M 30 0 C 48 -34, 82 -34, 96 0 C 82 34, 48 34, 30 0 Z" className="mandala__petal" />
          <circle r={32} className="mandala__line" />
          <circle r={24} className="mandala__line mandala__faint" />
        </>
      )}
      {form.kind === "thousand" && (
        <>
          <Petals count={32} r0={70} r1={96} />
          <Petals count={24} r0={60} r1={84} offset={0.5} />
          <Petals count={16} r0={52} r1={72} />
          <circle r={56} className="mandala__line" />
          {/* yantra of interlaced triangles, as in the official Sahasrara guide */}
          <g className="mandala__line">
            <polygon points={triangle(48, false)} />
            <polygon points={triangle(48, true)} />
            <polygon points={triangle(34, false)} />
            <polygon points={triangle(34, true)} />
            <polygon points={triangle(20, true)} />
          </g>
          <circle r={4} className="mandala__dot" />
        </>
      )}
    </svg>
  );
}
