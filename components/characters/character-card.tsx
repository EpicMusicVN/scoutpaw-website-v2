import Image from "next/image";
import Link from "next/link";
import { PupNose } from "@/components/ui/pup-nose";
import type { Character } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

type Variant = "default" | "featured" | "compact";

/**
 * Sticker-style character card. Per-character `accentColor` paints the backdrop
 * (with a scatter of that pup's nose behind it). Hover/focus draws the orange
 * pup-highlight ring and reveals a name pill from the bottom-center; the card
 * and the pup never move or scale, so pups in neighbouring cards stay on the
 * same ground line.
 *
 * Variants:
 * - default: square, used in legacy contexts (back-compat).
 * - featured: aspect-[1/2] + larger padding. For the magazine featured slot.
 * - compact: square + smaller padding. For the 2x2 sub-grid.
 */
export function CharacterCard({
  character,
  variant = "default",
  bgColor,
}: {
  character: Character;
  variant?: Variant;
  /**
   * Overrides the card backdrop color. Used by the home
   * "Meet the Whole Pack" showcase to set per-pup colors independently of the
   * shared `character.accentColor` (which still drives the Characters page).
   */
  bgColor?: string;
}) {
  const cardColor = bgColor ?? character.accentColor;
  const aspectClass =
    variant === "featured"
      ? "aspect-[1/2]"
      : "aspect-square";
  const padClass =
    variant === "featured"
      ? "p-8 md:p-10"
      : variant === "compact"
        ? "p-4 md:p-5"
        : "p-5";

  return (
    <Link
      href={`/characters/${character.slug}`}
      className="group block h-full focus-visible:outline-none"
      aria-label={`Meet ${character.name}, the ${character.breed}`}
    >
      <div
        className={`pup-highlight relative overflow-hidden rounded-[2rem] shadow-cozy ${aspectClass}`}
        style={{
          backgroundColor: cardColor,
        }}
      >
        {/* Nose scatter — this pup's nose, behind the character image. Fixed
            positions per card keep the visual rhythm consistent across the
            showcase. */}
        <CardNoseScatter slug={character.slug} />

        <Image
          src={assetUrl(character.image)}
          alt={`${character.name} the ${character.breed}`}
          fill
          sizes={
            variant === "featured"
              ? "(min-width: 1024px) 560px, (min-width: 640px) 50vw, 100vw"
              : "(min-width: 1024px) 240px, (min-width: 640px) 25vw, 50vw"
          }
          className={`relative object-contain object-bottom ${padClass}`}
        />

        {/* Hover/focus-reveal name pill — fades in from the card bottom. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="inline-flex items-center rounded-full bg-ink/90 px-4 py-1.5 font-display text-sm font-bold text-white shadow-md backdrop-blur-sm md:text-base">
            {character.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Fixed-position nose scatter for character card backdrops — five copies of the
 * card's own pup's nose at hand-tuned positions (same across every card for a
 * consistent visual rhythm).
 */
function CardNoseScatter({ slug }: { slug: string }) {
  const noses = [
    { top: "8%", left: "12%", rotate: -8, scale: 0.7 },
    { top: "20%", left: "78%", rotate: 10, scale: 0.5 },
    { top: "60%", left: "8%", rotate: 12, scale: 0.6 },
    { top: "72%", left: "82%", rotate: -10, scale: 0.5 },
    { top: "38%", left: "48%", rotate: 10, scale: 0.4 },
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden opacity-75"
    >
      {noses.map((n, i) => (
        <PupNose
          key={i}
          slug={slug}
          className="absolute h-10 w-10"
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
