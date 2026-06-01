import type { ReactNode } from "react";
import type { CharacterAtmosphere as AtmosphereId } from "@/lib/content/character-themes";

/**
 * Signature atmospheric layer for a character detail page — one distinctive,
 * full-bleed decorative mood per pup, tinted by the theme `decor` color. Sits
 * *behind* the `<CharacterMotif>` scatter and all copy; kept low-opacity so
 * hero text contrast holds (WCAG AA). Pure CSS/SVG, no client JS. Decorative
 * only — `aria-hidden`, `pointer-events-none`.
 */
export function CharacterAtmosphere({
  atmosphere,
  color,
}: {
  atmosphere: AtmosphereId;
  color: string;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {ATMOSPHERE[atmosphere](color)}
    </div>
  );
}

/**
 * Each atmosphere id → its decorative layer. `color` is a 6-digit hex; the
 * 2-digit suffixes (`26`, `1a`, …) append an alpha channel for soft tints.
 */
const ATMOSPHERE: Record<AtmosphereId, (color: string) => ReactNode> = {
  // Max — cozy bedtime night-light: stacked warm radial glows.
  nightlight: (color) => (
    <>
      <div
        className="absolute left-1/2 top-[16%] h-[520px] w-[520px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${color}55 0%, transparent 70%)`,
        }}
      />
      <div
        className="absolute left-[18%] top-[34%] h-64 w-64 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, ${color}33 0%, transparent 70%)`,
        }}
      />
    </>
  ),

  // Buddy — energetic motion: two scales of diagonal speed streaks.
  motion: (color) => (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `repeating-linear-gradient(118deg, ${color}26 0px, ${color}26 4px, transparent 4px, transparent 30px)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage: `repeating-linear-gradient(118deg, transparent 0px, transparent 62px, ${color}1a 62px, ${color}1a 76px)`,
        }}
      />
    </>
  ),

  // Bella — graceful ballet ribbons drifting across the layer.
  ribbons: (color) => (
    <svg
      className="absolute inset-0 h-full w-full"
      viewBox="0 0 1200 600"
      preserveAspectRatio="xMidYMid slice"
      fill="none"
    >
      <path
        d="M-50 120 C 200 40, 400 260, 650 140 S 1100 40, 1300 180"
        stroke={color}
        strokeWidth="16"
        strokeOpacity="0.16"
        strokeLinecap="round"
      />
      <path
        d="M-50 320 C 250 220, 480 460, 720 320 S 1150 240, 1300 380"
        stroke={color}
        strokeWidth="11"
        strokeOpacity="0.13"
        strokeLinecap="round"
      />
      <path
        d="M-50 480 C 220 420, 460 560, 760 470 S 1120 420, 1300 520"
        stroke={color}
        strokeWidth="8"
        strokeOpacity="0.1"
        strokeLinecap="round"
      />
    </svg>
  ),

  // Oscar — smart, studious blueprint grid (fine + coarse modules).
  blueprint: (color) => (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${color}1c 1px, transparent 1px), linear-gradient(90deg, ${color}1c 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(${color}12 1px, transparent 1px), linear-gradient(90deg, ${color}12 1px, transparent 1px)`,
          backgroundSize: "200px 200px",
        }}
      />
    </>
  ),

  // Rocky — adventurous layered mountain-ridge silhouettes.
  ridge: (color) => (
    <svg
      className="absolute inset-x-0 bottom-0 h-2/3 w-full"
      viewBox="0 0 1200 400"
      preserveAspectRatio="xMidYMax slice"
      fill="none"
    >
      <path
        d="M0 400 L0 250 L180 120 L340 240 L520 90 L700 230 L880 130 L1060 250 L1200 170 L1200 400 Z"
        fill={color}
        fillOpacity="0.1"
      />
      <path
        d="M0 400 L0 320 L220 210 L420 320 L640 200 L860 320 L1080 230 L1200 300 L1200 400 Z"
        fill={color}
        fillOpacity="0.14"
      />
    </svg>
  ),
};
