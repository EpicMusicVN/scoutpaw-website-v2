import { PawIcon } from "@/components/ui/paw-icon";

/**
 * Decorative scattered paw-print background. Used on the home Character
 * Showcase section. Positions are deterministically seeded so SSR + client
 * output match (no hydration warnings). Hidden below md to keep mobile DOM
 * clean and perf untouched.
 */

// Same seeded RNG pattern as AtmosphereLayer — keeps decoratives consistent
// across SSR boundary.
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

export function PawPrintPattern({ count = 24 }: { count?: number }) {
  const paws = Array.from({ length: count }, (_, i) => {
    const r1 = seededRand(i + 1);
    const r2 = seededRand(i + 100);
    const r3 = seededRand(i + 200);
    const r4 = seededRand(i + 300);
    return {
      top: `${r1 * 92}%`,
      left: `${r2 * 92}%`,
      rotate: r3 * 360,
      scale: 0.55 + r4 * 0.7,
    };
  });

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden overflow-hidden text-ink/10 md:block"
    >
      {paws.map((p, i) => (
        <PawIcon
          key={i}
          className="absolute h-10 w-10 md:h-12 md:w-12"
          style={{
            top: p.top,
            left: p.left,
            transform: `rotate(${p.rotate}deg) scale(${p.scale})`,
          }}
        />
      ))}
    </div>
  );
}
