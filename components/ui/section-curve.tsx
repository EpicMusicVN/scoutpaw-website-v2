type Position = "top" | "bottom";
type Variant = "wave" | "hill" | "cloud";

const PATHS: Record<Variant, { top: string; bottom: string; viewBox: string }> = {
  // Gentle sine — best for subtle section transitions.
  wave: {
    viewBox: "0 0 1440 80",
    top: "M0,80 Q360,0 720,40 T1440,40 L1440,0 L0,0 Z",
    bottom: "M0,0 Q360,80 720,40 T1440,40 L1440,80 L0,80 Z",
  },
  // Single rolling hill — bigger arc for landing-page hero edges.
  hill: {
    viewBox: "0 0 1440 100",
    top: "M0,100 C480,0 960,0 1440,100 L1440,0 L0,0 Z",
    bottom: "M0,0 C480,100 960,100 1440,0 L1440,100 L0,100 Z",
  },
  // Bumpy cloud line — playful, sticker-style edge.
  cloud: {
    viewBox: "0 0 1440 80",
    top: "M0,80 Q120,30 240,55 T480,55 T720,55 T960,55 T1200,55 T1440,55 L1440,0 L0,0 Z",
    bottom: "M0,0 Q120,50 240,25 T480,25 T720,25 T960,25 T1200,25 T1440,25 L1440,80 L0,80 Z",
  },
};

/**
 * SectionCurve — SVG wedge that breaks the rectangular edge of a section.
 * Place at the start (`position="top"`) or end (`position="bottom"`) of a section.
 * `color` should match the BACKGROUND of the section the curve is bleeding INTO,
 * so the curve appears to belong to the next section.
 */
export function SectionCurve({
  position,
  color,
  variant = "wave",
  height = 80,
  className = "",
}: {
  position: Position;
  color: string;
  variant?: Variant;
  height?: number;
  className?: string;
}) {
  const { viewBox, [position]: d } = PATHS[variant];
  const positionalClass = position === "top" ? "top-0" : "bottom-0";

  return (
    <svg
      aria-hidden="true"
      preserveAspectRatio="none"
      viewBox={viewBox}
      style={{ height }}
      className={`pointer-events-none absolute inset-x-0 ${positionalClass} w-full ${className}`}
    >
      <path d={d} fill={color} />
    </svg>
  );
}
