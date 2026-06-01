import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CharacterDetailHero } from "@/components/characters/character-detail-hero";
import { CharacterQuote } from "@/components/characters/character-quote";
import { Button } from "@/components/ui/button";
import { content } from "@/lib/content";
import { getCharacterTheme } from "@/lib/content/character-themes";
import { assetUrl } from "@/lib/utils/asset-url";

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const characters = await content.getCharacters();
  return characters.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const character = await content.getCharacterBySlug(slug);
  if (!character) return {};

  const description = character.bio.startsWith("TODO")
    ? `Meet ${character.name}, the ${character.breed} from ScoutPaw TV.`
    : character.bio;

  return {
    title: character.name,
    description,
    openGraph: {
      title: `${character.name} — ScoutPaw TV`,
      description,
      images: [{ url: assetUrl(character.image) }],
    },
  };
}

export default async function CharacterPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const character = await content.getCharacterBySlug(slug);
  if (!character) notFound();

  const theme = getCharacterTheme(slug);
  const channels = await content.getChannels();
  const channel = channels.find((c) => c.characterSlug === slug) ?? null;
  const hasBio = !character.bio.startsWith("TODO");

  return (
    <>
      <CharacterDetailHero
        character={character}
        theme={theme}
        channel={channel}
      />

      {/* Story block — themed soft tint behind the description + quote. */}
      <section
        className="px-4 py-14 md:py-20"
        style={{ backgroundColor: theme.surfaceTint }}
      >
        <div className="mx-auto max-w-2xl">
          {hasBio && (
            <p className="text-lg leading-relaxed text-ink-blue md:text-xl">
              {character.bio}
            </p>
          )}
          <div className="mt-8">
            <CharacterQuote
              quote={character.quote}
              accentColor={theme.decor}
            />
          </div>
          {/* Back link — folded into the themed block so the page closes
              cleanly on the surface tint. */}
          <div className="mt-10 flex justify-center md:mt-12">
            <Button href="/characters" variant="outline" size="md">
              ← Back to the pack
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
