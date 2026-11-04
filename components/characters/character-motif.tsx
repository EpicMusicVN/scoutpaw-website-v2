import type { CSSProperties } from "react";
import { PupNose } from "@/components/ui/pup-nose";

/** Scatter layout — size/rotation/drift speed varied per spot. */
const SPOTS: { top: string; left: string; size: number; rot: number; dur: number }[] = [
  { top: "9%", left: "6%", size: 58, rot: -8, dur: 7 },
  { top: "15%", left: "85%", size: 44, rot: 12, dur: 8.5 },
  { top: "60%", left: "9%", size: 50, rot: 8, dur: 9 },
  { top: "72%", left: "80%", size: 64, rot: -10, dur: 7.8 },
  { top: "40%", left: "93%", size: 32, rot: 10, dur: 10 },
  { top: "86%", left: "42%", size: 38, rot: -6, dur: 8.2 },
];

/**
 * Decorative motif backdrop for a character scene / detail page: the pup's own
 * nose scattered across the layer, gently drifting (drift auto-disabled under
 * reduced-motion via the global CSS reset). Decorative only — `aria-hidden`,
 * `pointer-events-none`.
 */
export function CharacterMotif({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`}
    >
      {SPOTS.map((spot, i) => (
        <PupNose
          key={i}
          slug={slug}
          className="absolute opacity-35 md:opacity-60"
          style={
            {
              top: spot.top,
              left: spot.left,
              width: spot.size,
              height: spot.size,
              "--paw-rotate": `${spot.rot}deg`,
              animation: `paw-drift ${spot.dur}s ease-in-out infinite`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
