import Image from "next/image";
import Link from "next/link";
import { PawIcon } from "@/components/ui/paw-icon";
import type { Character } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

type Variant = "default" | "featured" | "compact";

/**
 * Sticker-style character card. Per-character `accentColor` paints the backdrop
 * (with a subtle paw scatter overlay) and the hover glow ring. Hover lifts the
 * card and reveals a name pill from the bottom-center.
 *
 * Variants:
 * - default: square, used in legacy contexts (back-compat).
 * - featured: aspect-[1/2] + larger padding. For the magazine featured slot.
 * - compact: square + smaller padding. For the 2x2 sub-grid.
 */
export function CharacterCard({
  character,
  variant = "default",
}: {
  character: Character;
  variant?: Variant;
}) {
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
        className={`relative overflow-hidden rounded-[2rem] shadow-cozy transition-all duration-300 ease-gentle group-hover:-translate-y-1.5 group-hover:shadow-cozy-xl ${aspectClass}`}
        style={{
          backgroundColor: character.accentColor,
        }}
      >
        {/* Paw scatter — behind the character image. Fixed positions per card
            keep the visual rhythm consistent across the showcase. */}
        <CardPawScatter />

        {/* Soft inner glow ring on hover, accent-tinted. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[2rem] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            boxShadow: `inset 0 0 0 4px rgba(255,255,255,0.55), 0 0 32px ${character.accentColor}aa`,
          }}
        />

        <Image
          src={assetUrl(character.image)}
          alt={`${character.name} the ${character.breed}`}
          fill
          sizes={
            variant === "featured"
              ? "(min-width: 1024px) 560px, (min-width: 640px) 50vw, 100vw"
              : "(min-width: 1024px) 240px, (min-width: 640px) 25vw, 50vw"
          }
          className={`relative object-contain transition-transform duration-500 ease-out group-hover:scale-105 ${padClass}`}
        />

        {/* Hover-reveal name pill — fades in + slides up from card bottom. */}
        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center opacity-0 transition-all duration-300 group-hover:bottom-6 group-hover:opacity-100">
          <span className="inline-flex items-center rounded-full bg-ink/90 px-4 py-1.5 font-display text-sm font-bold text-white shadow-md backdrop-blur-sm md:text-base">
            {character.name}
          </span>
        </div>
      </div>
    </Link>
  );
}

/**
 * Fixed-position paw scatter for character card backdrops. 5 paws at
 * hand-tuned positions — no random/seed needed since positions are the same
 * across every card (consistent visual rhythm).
 */
function CardPawScatter() {
  const paws = [
    { top: "8%", left: "12%", rotate: -15, scale: 0.7 },
    { top: "20%", left: "78%", rotate: 25, scale: 0.5 },
    { top: "60%", left: "8%", rotate: 40, scale: 0.6 },
    { top: "72%", left: "82%", rotate: -25, scale: 0.5 },
    { top: "38%", left: "48%", rotate: 10, scale: 0.4 },
  ];
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden text-white/20"
    >
      {paws.map((p, i) => (
        <PawIcon
          key={i}
          className="absolute h-10 w-10"
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
