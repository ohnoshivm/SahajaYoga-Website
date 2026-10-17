/** One drawn icon set for Sadhana: 24px grid, 1.6 stroke, round caps. */
const PATHS = {
  plus: 'M12 5v14M5 12h14',
  minus: 'M5 12h14',
  close: 'M6 6l12 12M18 6 6 18',
  left: 'M14.5 6 8.5 12l6 6',
  right: 'M9.5 6l6 6-6 6',
  up: 'M6 14.5 12 8.5l6 6',
  down: 'M6 9.5l6 6 6-6',
  pause: 'M9 6v12M15 6v12',
  play: 'M8 5.5v13l10.5-6.5L8 5.5Z',
  next: 'M6 6l8 6-8 6V6ZM18 6v12',
  back: 'M18 6l-8 6 8 6V6ZM6 6v12',
  stop: 'M7 7h10v10H7z',
  trash: 'M5 7h14M10 7V5h4v2M7 7l1 12h8l1-12',
  grip: 'M9 6h.01M15 6h.01M9 12h.01M15 12h.01M9 18h.01M15 18h.01',
} as const

export type IconName = keyof typeof PATHS

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const filled = name === 'play'
  return (
    <svg className="ic" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d={PATHS[name]}
        fill={filled ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={name === 'grip' ? 3 : 1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
