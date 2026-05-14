/**
 * Decorative cloud-cluster divider for between-section placement.
 * Three mini cloud SVGs in a horizontal row, centered in a max-w-md container.
 * Block-level, pure decorative, aria-hidden.
 */
export function CloudDivider({
  opacity = 0.7,
  className,
}: {
  opacity?: number;
  className?: string;
}) {
  return (
    <div
      aria-hidden
      className={`mx-auto flex max-w-md items-center justify-center gap-3 py-6 md:gap-4 md:py-8 ${className ?? ""}`}
    >
      <MiniCloud className="h-7 w-14 md:h-8 md:w-16" opacity={opacity * 0.6} />
      <MiniCloud className="h-10 w-20 md:h-12 md:w-24" opacity={opacity} />
      <MiniCloud className="h-7 w-14 md:h-8 md:w-16" opacity={opacity * 0.6} />
    </div>
  );
}

function MiniCloud({
  className,
  opacity,
}: {
  className: string;
  opacity: number;
}) {
  return (
    <svg
      viewBox="0 0 80 50"
      aria-hidden
      className={className}
      style={{ opacity }}
    >
      <ellipse cx="20" cy="30" rx="16" ry="11" fill="white" />
      <ellipse cx="45" cy="22" rx="22" ry="16" fill="white" />
      <ellipse cx="65" cy="30" rx="14" ry="10" fill="white" />
    </svg>
  );
}
