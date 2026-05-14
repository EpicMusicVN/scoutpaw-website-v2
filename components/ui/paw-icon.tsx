/**
 * Shared paw-print SVG used by CornerPaws (newsletter) and PawPrintPattern
 * (character showcase decorative bg). Color via `currentColor` — set via Tailwind
 * text-* class on the parent.
 */
export function PawIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 64 64"
      className={className}
      style={style}
    >
      <ellipse cx="32" cy="42" rx="14" ry="10" fill="currentColor" />
      <ellipse cx="14" cy="26" rx="6" ry="8" fill="currentColor" />
      <ellipse cx="50" cy="26" rx="6" ry="8" fill="currentColor" />
      <ellipse cx="22" cy="14" rx="5" ry="7" fill="currentColor" />
      <ellipse cx="42" cy="14" rx="5" ry="7" fill="currentColor" />
    </svg>
  );
}
