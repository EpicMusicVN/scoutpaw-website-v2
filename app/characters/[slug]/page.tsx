import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CharacterHero } from "@/components/characters/character-hero";
import { FunFactsList } from "@/components/characters/fun-facts-list";
import { Button } from "@/components/ui/button";
import { content } from "@/lib/content";
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

  const hasBio = !character.bio.startsWith("TODO");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-12">
      <CharacterHero character={character} />

      {hasBio && (
        <section className="mx-auto mt-16 max-w-3xl">
          <p className="text-xl leading-relaxed text-ink/85 md:text-2xl">{character.bio}</p>
        </section>
      )}

      <div className="mt-16">
        <FunFactsList character={character} />
      </div>

      <div className="mt-16 flex justify-center">
        <Button href="/" variant="outline" size="md">
          ← Back to the pack
        </Button>
      </div>
    </div>
  );
}
