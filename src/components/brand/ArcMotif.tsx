export function ArcMotif({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
    >
      <circle cx="200" cy="200" r="196" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="152" strokeWidth="1.5" />
      <circle cx="200" cy="200" r="108" strokeWidth="1.5" />
      <path d="M92 236 L168 132 L228 214 L268 168 L308 236" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
