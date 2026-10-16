import type { Finger } from "./registry";

/**
 * An open right hand, palm up, with the point where a chakra is felt
 * (official Sahaja Yoga hand chart: thumb 2, index 5, middle 3, ring 6, little 4,
 * base of palm 1, centre of palm 7). Purely illustrative, not a diagnostic tool.
 */
const FINGERS: { id: Finger; x: number; y: number; h: number; rot: number }[] = [
  { id: "thumb", x: 14, y: 70, h: 30, rot: -48 },
  { id: "index", x: 30, y: 34, h: 40, rot: -10 },
  { id: "middle", x: 46, y: 28, h: 44, rot: -1 },
  { id: "ring", x: 61, y: 32, h: 40, rot: 8 },
  { id: "little", x: 74, y: 44, h: 32, rot: 17 },
];

export function HandMap({ finger, label }: { finger: Finger; label: string }) {
  return (
    <figure className="handmap" aria-label={label}>
      <svg viewBox="0 0 100 130" aria-hidden="true">
        {FINGERS.map((f) => (
          <rect
            key={f.id}
            x={f.x - 6}
            y={f.y}
            width={12}
            height={f.h}
            rx={6}
            transform={`rotate(${f.rot} ${f.x} ${f.y + f.h})`}
            className={f.id === finger ? "handmap__part handmap__part--on" : "handmap__part"}
          />
        ))}
        <path
          d="M 18 74 C 18 66, 24 64, 28 66 L 76 70 C 82 72, 84 78, 82 86 C 80 104, 72 120, 50 122 C 30 122, 20 108, 18 92 Z"
          className="handmap__part"
        />
        <circle cx={50} cy={92} r={8} className={finger === "palm-centre" ? "handmap__dot handmap__dot--on" : "handmap__dot"} />
        <ellipse cx={50} cy={116} rx={14} ry={5} className={finger === "palm-heel" ? "handmap__dot handmap__dot--on" : "handmap__dot"} />
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  );
}
