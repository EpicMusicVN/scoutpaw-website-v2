"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useId, useMemo, useState } from "react";

type Variant = "honey" | "peach" | "sky" | "sage" | "warm-tan";
type Density = "low" | "med" | "high";

const variantPalette: Record<Variant, { paw: string; dust: string; cloud: string }> = {
  honey: { paw: "#ffd70c", dust: "#ffe968", cloud: "#e8f6f7" },
  peach: { paw: "#ff9f7a", dust: "#ffd2b8", cloud: "#ffe8d6" },
  sky: { paw: "#7dc4e2", dust: "#b6e3f4", cloud: "#ddeef7" },
  sage: { paw: "#7bc47f", dust: "#b8e0c8", cloud: "#dff0e3" },
  "warm-tan": { paw: "#b8862e", dust: "#ecdcb8", cloud: "#fff1c9" },
};

const densityCounts: Record<Density, { paws: number; dust: number; clouds: number }> = {
  low: { paws: 3, dust: 6, clouds: 1 },
  med: { paws: 5, dust: 12, clouds: 2 },
  high: { paws: 8, dust: 20, clouds: 3 },
};

// Deterministic pseudo-random so SSR + client output match (no hydration warnings).
function seededRand(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

interface Position {
  top: string;
  left: string;
  size: number;
  rotate: number;
  delay: number;
}

function generatePositions(count: number, seedOffset: number, sizeMin: number, sizeMax: number): Position[] {
  return Array.from({ length: count }, (_, i) => {
    const s = seedOffset + i * 17;
    return {
      top: `${(seededRand(s) * 90 + 5).toFixed(2)}%`,
      left: `${(seededRand(s + 1) * 90 + 5).toFixed(2)}%`,
      size: Math.round(seededRand(s + 2) * (sizeMax - sizeMin) + sizeMin),
      rotate: Math.round(seededRand(s + 3) * 60 - 30),
      delay: seededRand(s + 4) * 4,
    };
  });
}

/**
 * AtmosphereLayer — drops a layer of soft animated decoratives behind page content.
 * Renders absolute-positioned SVG paw prints, dust motes, and cloud blobs.
 * All elements `aria-hidden`. Animations halt under `prefers-reduced-motion`.
 *
 * Usage: place inside a relatively-positioned section. Sits at z-index 0 by default.
 */
export function AtmosphereLayer({
  variant = "honey",
  density = "med",
  className = "",
}: {
  variant?: Variant;
  density?: Density;
  className?: string;
}) {
  // Animations only after mount — `useReducedMotion` returns false on SSR,
  // so gating on `mounted` avoids a hydration mismatch in inline `style.animation`.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduce = useReducedMotion();
  const animate = mounted && !reduce;
  const id = useId();
  const palette = variantPalette[variant];
  const counts = densityCounts[density];

  const paws = useMemo(() => generatePositions(counts.paws, 1, 22, 44), [counts.paws]);
  const dust = useMemo(() => generatePositions(counts.dust, 200, 4, 9), [counts.dust]);
  const clouds = useMemo(() => generatePositions(counts.clouds, 500, 180, 320), [counts.clouds]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 -z-0 overflow-hidden ${className}`}
    >
      {clouds.map((c, i) => (
        <div
          key={`c-${id}-${i}`}
          style={{
            position: "absolute",
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size * 0.5,
            backgroundColor: palette.cloud,
            opacity: 0.55,
            filter: "blur(40px)",
            borderRadius: "999px",
            animation: animate ? `cloud-drift 24s ease-in-out ${c.delay}s infinite alternate` : undefined,
          }}
        />
      ))}

      {paws.map((p, i) => (
        <svg
          key={`p-${id}-${i}`}
          width={p.size}
          height={p.size}
          viewBox="0 0 64 64"
          style={{
            position: "absolute",
            top: p.top,
            left: p.left,
            color: palette.paw,
            opacity: 0.18,
            ["--paw-rotate" as string]: `${p.rotate}deg`,
            transform: `rotate(${p.rotate}deg)`,
            animation: animate ? `paw-drift 6s ease-in-out ${p.delay}s infinite` : undefined,
          }}
        >
          <ellipse cx="32" cy="42" rx="14" ry="10" fill="currentColor" />
          <ellipse cx="14" cy="26" rx="6" ry="8" fill="currentColor" />
          <ellipse cx="50" cy="26" rx="6" ry="8" fill="currentColor" />
          <ellipse cx="22" cy="14" rx="5" ry="7" fill="currentColor" />
          <ellipse cx="42" cy="14" rx="5" ry="7" fill="currentColor" />
        </svg>
      ))}

      {dust.map((d, i) => (
        <span
          key={`d-${id}-${i}`}
          style={{
            position: "absolute",
            top: d.top,
            left: d.left,
            width: d.size,
            height: d.size,
            backgroundColor: palette.dust,
            opacity: 0.5,
            borderRadius: "999px",
            animation: animate ? `dust-float 5s ease-in-out ${d.delay}s infinite` : undefined,
          }}
        />
      ))}
    </div>
  );
}
