import { PupNose, packNoseAt } from "@/components/ui/pup-nose";

// Same seeded RNG as PawPrintPattern / AtmosphereLayer — deterministic
// positions so SSR and client output match (no hydration warnings).
function seededRand(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Decorative scatter of the pack's noses, cycling through all five pups. Used
 * as a section background (home "Meet the Whole Pack" showcase). Hidden below
 * md to keep the mobile DOM light.
 */
export function NosePattern({ count = 24 }: { count?: number }) {
  const noses = Array.from({ length: count }, (_, i) => ({
    top: `${seededRand(i + 1) * 92}%`,
    left: `${seededRand(i + 100) * 92}%`,
    rotate: seededRand(i + 200) * 30 - 15,
    scale: 0.55 + seededRand(i + 300) * 0.7,
  }));

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 hidden overflow-hidden opacity-60 md:block"
    >
      {noses.map((n, i) => (
        <PupNose
          key={i}
          slug={packNoseAt(i)}
          className="absolute h-10 w-10 md:h-12 md:w-12"
          style={{
            top: n.top,
            left: n.left,
            transform: `rotate(${n.rotate}deg) scale(${n.scale})`,
          }}
        />
      ))}
    </div>
  );
}
