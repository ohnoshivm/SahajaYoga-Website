/** Small line-art lotus used beside the wordmark (kept from the approved hero). */
export function LotusMark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {/* centre petal */}
      <path d="M24 3.5c-3.6 4.4-5.2 9.2-5.2 13.4 0 5.2 2.4 9.4 5.2 11.6 2.8-2.2 5.2-6.4 5.2-11.6 0-4.2-1.6-9-5.2-13.4Z" />
      {/* inner side petals */}
      <path d="M18.9 12.2c-3.8 1-6.6 3.4-7.8 6.8-1.3 3.7.2 7.2 2.9 8.8 2.8.8 6.6.4 10-1.3" />
      <path d="M29.1 12.2c3.8 1 6.6 3.4 7.8 6.8 1.3 3.7-.2 7.2-2.9 8.8-2.8.8-6.6.4-10-1.3" />
      {/* outer petals */}
      <path d="M11.3 18.6c-3.4-.4-6.6.5-8.8 2.8 1.6 3.9 5.8 6.4 11.3 6.4" />
      <path d="M36.7 18.6c3.4-.4 6.6.5 8.8 2.8-1.6 3.9-5.8 6.4-11.3 6.4" />
      {/* base */}
      <path d="M9.5 28.6c4.4 1.6 9.4 2.2 14.5 2.2s10.1-.6 14.5-2.2" />
    </svg>
  );
}
