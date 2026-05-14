import Image from "next/image";
import type { Character } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

export function CharacterHero({ character }: { character: Character }) {
  return (
    <section
      className="relative overflow-hidden rounded-[2.5rem] px-6 py-12 md:px-16 md:py-20"
      style={{ backgroundColor: `${character.accentColor}22` }}
    >
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <p
            className="font-display text-sm font-bold uppercase tracking-widest"
            style={{ color: character.accentColor }}
          >
            {character.breed}
          </p>
          <h1 className="mt-2 font-display text-5xl font-bold text-ink md:text-7xl">
            {character.name}
          </h1>
          {!character.tagline.startsWith("TODO") && (
            <p className="mt-4 text-lg text-ink/80 md:text-2xl">{character.tagline}</p>
          )}
        </div>
        <div className="relative aspect-square w-full max-w-[420px] justify-self-center">
          <Image
            src={assetUrl(character.image)}
            alt={`${character.name} the ${character.breed}`}
            fill
            sizes="(min-width: 768px) 420px, 80vw"
            priority
            className="object-contain"
          />
        </div>
      </div>
    </section>
  );
}
