/**
 * Fixed-position decorative clouds along the viewport's left + right edges.
 * Visible only on widescreens (>=xl / 1280px) where the cyan page bg gutters
 * are wide enough to host atmospheric decoration without overlapping content.
 *
 * Four distinct shape variants (long-soft, fluffy-round, stretched, mini) keep
 * the decoration from feeling repetitive.
 *
 * Pure decorative; aria-hidden; pointer-events-none.
 */
export function SideClouds() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 hidden xl:block"
    >
      {/* Left flank */}
      <LongCloud className="left-0 top-[12%] h-16 w-44" opacity={0.5} />
      <FluffyCloud className="left-4 top-[42%] h-24 w-32" opacity={0.6} />
      <MiniCloud className="left-6 top-[68%] h-14 w-24" opacity={0.45} />
      <StretchedCloud className="left-0 top-[88%] h-12 w-52" opacity={0.4} />
      {/* Right flank */}
      <FluffyCloud className="right-2 top-[22%] h-20 w-28" opacity={0.55} />
      <StretchedCloud className="right-0 top-[50%] h-12 w-48" opacity={0.45} />
      <MiniCloud className="right-6 top-[74%] h-14 w-24" opacity={0.5} />
      <LongCloud className="right-0 top-[92%] h-14 w-40" opacity={0.4} />
    </div>
  );
}

type ShapeProps = {
  className: string;
  opacity?: number;
};

/** Long horizontal cloud — 5 bumps stretched wide. */
function LongCloud({ className, opacity = 0.5 }: ShapeProps) {
  return (
    <svg
      viewBox="0 0 180 50"
      aria-hidden
      className={`absolute ${className}`}
      style={{ opacity }}
    >
      <ellipse cx="30" cy="35" rx="22" ry="12" fill="white" />
      <ellipse cx="65" cy="28" rx="30" ry="18" fill="white" />
      <ellipse cx="105" cy="30" rx="28" ry="15" fill="white" />
      <ellipse cx="145" cy="34" rx="22" ry="13" fill="white" />
      <ellipse cx="170" cy="38" rx="10" ry="8" fill="white" />
    </svg>
  );
}

/** Rounded fluffy cloud — taller, 3 chunky bumps. */
function FluffyCloud({ className, opacity = 0.5 }: ShapeProps) {
  return (
    <svg
      viewBox="0 0 120 80"
      aria-hidden
      className={`absolute ${className}`}
      style={{ opacity }}
    >
      <ellipse cx="30" cy="55" rx="26" ry="18" fill="white" />
      <ellipse cx="58" cy="40" rx="32" ry="24" fill="white" />
      <ellipse cx="90" cy="50" rx="24" ry="18" fill="white" />
    </svg>
  );
}

/** Stretched cinematic cloud — very wide, narrow. */
function StretchedCloud({ className, opacity = 0.5 }: ShapeProps) {
  return (
    <svg
      viewBox="0 0 220 40"
      aria-hidden
      className={`absolute ${className}`}
      style={{ opacity }}
    >
      <ellipse cx="40" cy="25" rx="32" ry="10" fill="white" />
      <ellipse cx="100" cy="20" rx="40" ry="12" fill="white" />
      <ellipse cx="170" cy="24" rx="35" ry="11" fill="white" />
      <ellipse cx="210" cy="28" rx="12" ry="6" fill="white" />
    </svg>
  );
}

/** Mini compact cloud — 3 small bumps. */
function MiniCloud({ className, opacity = 0.5 }: ShapeProps) {
  return (
    <svg
      viewBox="0 0 80 50"
      aria-hidden
      className={`absolute ${className}`}
      style={{ opacity }}
    >
      <ellipse cx="20" cy="30" rx="16" ry="11" fill="white" />
      <ellipse cx="45" cy="22" rx="22" ry="16" fill="white" />
      <ellipse cx="65" cy="30" rx="14" ry="10" fill="white" />
    </svg>
  );
}
