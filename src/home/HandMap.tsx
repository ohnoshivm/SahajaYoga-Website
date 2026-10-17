import { CENTRES } from './data'
import { HAND_MAP } from './data'

/** Palm-up hand (shared with the chakra guide's drawing), with each centre's point on it. */
const POINTS: Record<(typeof HAND_MAP)[number]['point'], [number, number]> = {
  heel: [53, 152],
  centre: [54, 104],
  void: [54, 104],
  thumb: [17, 90],
  index: [39.5, 32],
  middle: [50.5, 21],
  ring: [61.5, 28],
  little: [72, 46],
}

const HAND = 'M30 168 V130 C16 118 8 102 10 88 C11 80 20 78 26 86 L34 100 V36 C34 26 45 26 45 36 V24 C45 13 56 13 56 24 V30 C56 20 67 20 67 30 V48 C67 39 77 39 77 48 V114 C77 130 71 142 64 148 V168'

function Hand({ mirror, label }: { mirror?: boolean; label: string }) {
  return (
    <figure className="hand">
      <svg viewBox="0 0 90 176" role="img" aria-label={`${label}, palm up, with the point for each centre`} style={mirror ? { transform: 'scaleX(-1)' } : undefined}>
        <path d={HAND} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" strokeLinecap="round" opacity="0.7" />
        <path d="M45 36 V64 M56 30 V62 M67 48 V66" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
        {HAND_MAP.map((m) => {
          const [x, y] = POINTS[m.point]
          const glow = CENTRES.find((c) => c.id === m.centre)!.glow
          if (m.point === 'void')
            return <circle key={m.point} cx={x} cy={y} r="11" fill="none" stroke={glow} strokeWidth="1.4" opacity="0.8" />
          return (
            <g key={m.point}>
              <circle cx={x} cy={y} r="7" fill={glow} opacity="0.22" />
              <circle cx={x} cy={y} r="3.2" fill={glow} />
            </g>
          )
        })}
      </svg>
      <figcaption>{label}</figcaption>
    </figure>
  )
}

export function HandMap() {
  return (
    <div className="handmap">
      <div className="handmap-hands">
        <Hand label="Left hand · the left side" />
        <Hand label="Right hand · the right side" mirror />
      </div>
      <ul className="handmap-key">
        {HAND_MAP.map((m) => {
          const c = CENTRES.find((x) => x.id === m.centre)!
          const where = { heel: 'Base of the palm', thumb: 'Thumbs', index: 'Index fingers', middle: 'Middle fingers', ring: 'Ring fingers', little: 'Little fingers', centre: 'Centre of the palm', void: 'Around the palm centre' }[m.point]
          return (
            <li key={m.point}>
              <i style={{ background: c.glow }} />
              <b>{m.label}</b>
              <span>{where}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
