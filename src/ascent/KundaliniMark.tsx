/** The Kundalini as shown in the official chart: a spiral coiled 3½ times within the triangular sacrum bone. */
export function KundaliniMark() {
  // Archimedean spiral, 3.5 turns
  const turns = 3.5;
  const steps = 160;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const a = t * turns * Math.PI * 2;
    const r = 2 + t * 24;
    pts.push(`${(Math.cos(a) * r).toFixed(2)},${(Math.sin(a) * r + 6).toFixed(2)}`);
  }
  return (
    <svg viewBox="-60 -50 120 110" aria-hidden="true" className="kundalini">
      <polygon points="-52,-40 52,-40 0,52" className="kundalini__bone" />
      <polyline points={pts.join(" ")} className="kundalini__coil" />
    </svg>
  );
}
