export function LotusMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round">
        <path d="M24 3.5C28.2 10 28.2 20 24 27.5 19.8 20 19.8 10 24 3.5Z" />
        <path d="M24 27.5C21 19 15 13.2 7.5 12.2 8.3 20.5 15 26.6 24 27.5Z" />
        <path d="M24 27.5C27 19 33 13.2 40.5 12.2 39.7 20.5 33 26.6 24 27.5Z" />
        <path d="M24 27.5C16 26.6 7 24.4 1.5 19.5 7.2 27 15.6 29.4 24 27.5Z" />
        <path d="M24 27.5C32 26.6 41 24.4 46.5 19.5 40.8 27 32.4 29.4 24 27.5Z" />
      </g>
    </svg>
  );
}

export function ArrowDown({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 22 44" className={className} aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M11 1v41" />
        <path d="M1.5 32.5 11 42l9.5-9.5" />
      </g>
    </svg>
  );
}
