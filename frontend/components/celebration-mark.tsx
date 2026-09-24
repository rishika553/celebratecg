/** An open venue arch framing a rising sun: CelebrateCG's invitation to gather. */
export default function CelebrationMark({ size = 28 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
    <path d="M7 33V18a13 13 0 0 1 26 0v15M13 33V18a7 7 0 0 1 14 0v15M4 34h32" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <circle cx="20" cy="22" r="3" fill="currentColor" />
    <path d="M17 30h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>;
}
