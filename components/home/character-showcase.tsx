import { CharacterCard } from "@/components/characters/character-card";
import { PawPrintPattern } from "@/components/ui/paw-print-pattern";
import { content } from "@/lib/content";

/**
 * Magazine-style character showcase: featured-left + 2×2 grid right. First
 * character renders large; remaining 4 render as compact squares. Scattered
 * paw-print pattern decorates the section bg (md+ only). Stacks vertically
 * on mobile.
 */
export async function CharacterShowcase() {
  const characters = await content.getCharacters();
  const [featured, ...rest] = characters.slice(0, 5);

  if (!featured) return null;

  return (
    <section
      id="meet-the-pack"
      className="relative scroll-mt-24 overflow-hidden py-24 md:py-32"
    >
      <PawPrintPattern />

      <div className="relative mx-auto max-w-hero px-4 md:px-8">
        <header className="text-center">
          <p className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-gold md:text-sm">
            Explore Characters
          </p>
          <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-6xl lg:text-7xl">
            Meet the Whole Pack
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-ink/85 md:text-lg">
            Five distinct pups, each with their own quirks, songs, and favourite
            napping spots. Pick a friend and dive in.
          </p>
        </header>

        {/* Magazine layout: featured-left + 2x2 grid right (md+).
            Stacks vertically on mobile. */}
        <div className="mt-14 grid gap-5 md:grid-cols-[1fr_2fr] md:gap-6 lg:gap-8">
          <CharacterCard character={featured} variant="featured" />
          <div className="grid grid-cols-2 gap-5 md:gap-6 lg:gap-8">
            {rest.map((c) => (
              <CharacterCard key={c.slug} character={c} variant="compact" />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
