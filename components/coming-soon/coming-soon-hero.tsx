import Image from "next/image";
import type { Character, ComingSoonPage } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

export function ComingSoonHero({
  page,
  character,
}: {
  page: ComingSoonPage;
  character: Character;
}) {
  return (
    <section className="px-4 py-12 text-center md:px-8 md:py-16">
      <div className="relative mx-auto h-48 w-48 md:h-64 md:w-64">
        <Image
          src={assetUrl(character.image)}
          alt={`${character.name} the ${character.breed}`}
          fill
          sizes="(min-width: 768px) 256px, 192px"
          priority
          className="object-contain"
        />
      </div>
      <p className="mt-4 font-display text-sm font-bold uppercase tracking-widest text-ink-blue">
        Coming Soon
      </p>
      <h1 className="mt-2 font-display text-3xl font-bold leading-tight heading-sticker-honey md:text-5xl">
        {page.title}
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-base text-ink-blue/85 md:text-lg">
        {page.tagline}
      </p>
    </section>
  );
}
