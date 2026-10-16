/**
 * Ten lap markers on a shallow arc beneath the anchor: deliberately seeds,
 * not petals, so they never misrepresent a chakra's petal count.
 */
export function LapSeeds({ total, lit, complete }: { total: number; lit: number; complete: boolean }) {
  const width = 300;
  const sag = 26;
  return (
    <svg viewBox={`0 0 ${width} 60`} className="seeds" aria-hidden="true" data-complete={complete}>
      {Array.from({ length: total }, (_, i) => {
        const t = total === 1 ? 0.5 : i / (total - 1);
        const x = 14 + t * (width - 28);
        const y = 12 + Math.sin(Math.PI * t) * sag;
        const on = complete || i < lit;
        const current = !complete && i === lit - 1;
        return (
          <g key={i} transform={`translate(${x} ${y})`}>
            <ellipse rx={on ? 5.2 : 4} ry={on ? 7.2 : 5.6} className={on ? "seed seed--on" : "seed"} />
            {current && <ellipse rx={10} ry={13} className="seed__halo" />}
          </g>
        );
      })}
    </svg>
  );
}
