import type { CSSProperties, ReactNode } from "react";
import type { CharacterMotif as MotifId } from "@/lib/content/character-themes";

/**
 * Inner SVG (64×64 viewBox) for each motif — children inherit `fill` from the
 * parent `<svg>`, which is tinted with the theme decor color.
 */
const MOTIF_SHAPE: Record<MotifId, ReactNode> = {
  notes: (
    <>
      <circle cx="20" cy="46" r="13" />
      <rect x="30" y="9" width="6" height="39" />
      <path d="M36 9q19 4 15 24q-3 -13 -15 -13z" />
    </>
  ),
  bursts: (
    <path d="M32 2 39 25 62 32 39 39 32 62 25 39 2 32 25 25Z" />
  ),
  sparkles: (
    <path d="M32 6C35 25 39 29 58 32 39 35 35 39 32 58 29 39 25 35 6 32 25 29 29 25 32 6Z" />
  ),
  geo: (
    <path d="M32 6 58 54 6 54Z" />
  ),
  mountains: (
    <path d="M4 56 24 16 36 36 46 20 60 56Z" />
  ),
};

/** Scatter layout — shared across motifs; size/rotation/speed varied per spot. */
const SPOTS: { top: string; left: string; size: number; rot: number; dur: number }[] = [
  { top: "9%", left: "6%", size: 58, rot: -14, dur: 7 },
  { top: "15%", left: "85%", size: 44, rot: 12, dur: 8.5 },
  { top: "60%", left: "9%", size: 50, rot: 8, dur: 9 },
  { top: "72%", left: "80%", size: 64, rot: -10, dur: 7.8 },
  { top: "40%", left: "93%", size: 32, rot: 20, dur: 10 },
  { top: "86%", left: "42%", size: 38, rot: -6, dur: 8.2 },
];

/**
 * Decorative motif backdrop for a character detail page. Scatters the theme's
 * emblematic shape across the layer, tinted by `color`, gently drifting (drift
 * auto-disabled under reduced-motion via the global CSS reset). Decorative
 * only — `aria-hidden`, `pointer-events-none`.
 */
export function CharacterMotif({
  motif,
  color,
  className,
}: {
  motif: MotifId;
  color: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {SPOTS.map((spot, i) => (
        <svg
          key={i}
          viewBox="0 0 64 64"
          width={spot.size}
          height={spot.size}
          style={
            {
              position: "absolute",
              top: spot.top,
              left: spot.left,
              color,
              fill: "currentColor",
              opacity: 0.16,
              "--paw-rotate": `${spot.rot}deg`,
              animation: `paw-drift ${spot.dur}s ease-in-out infinite`,
            } as CSSProperties
          }
        >
          {MOTIF_SHAPE[motif]}
        </svg>
      ))}
    </div>
  );
}
