import type { Metadata } from "next";
import { CharacterSection } from "@/components/characters/character-section";
import { FullBleedHero } from "@/components/home/full-bleed-hero";
import { NewsletterCTA } from "@/components/home/newsletter-cta";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { JsonLd } from "@/components/seo/json-ld";
import { content, type Channel, type Character } from "@/lib/content";
import { getCharacterTheme } from "@/lib/content/character-themes";
import { bannerOgImage } from "@/lib/seo/og-image";
import { getSiteUrl } from "@/lib/seo/site-url";
import { breadcrumbSchema } from "@/lib/seo/structured-data";

const PAGE_DESCRIPTION =
  "Meet the ScoutPaw pack — Max, Buddy, Bella, Oscar and Rocky. Five musical best friends, each with their own song, story, and pack-approved gear.";

export const metadata: Metadata = {
  title: "Characters",
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/characters" },
  openGraph: {
    title: "Characters — ScoutPaw TV",
    description: PAGE_DESCRIPTION,
    url: "/characters",
    images: [bannerOgImage("Meet the ScoutPaw pack")],
  },
};

// Explicit page order — independent of the JSON `order` field (which drives the
// home featured pup). Max anchors the page as the pack captain.
const PAGE_ORDER = ["max", "buddy", "bella", "oscar", "rocky"] as const;

export default async function CharactersPage() {
  const [characters, channels] = await Promise.all([
    content.getCharacters(),
    content.getChannels(),
  ]);
  const bySlug = new Map(characters.map((c) => [c.slug, c]));
  const channelBy = new Map<string, Channel>(
    channels.map((c) => [c.characterSlug, c]),
  );
  const ordered = PAGE_ORDER.map((slug) => bySlug.get(slug)).filter(
    (c): c is Character => Boolean(c),
  );

  const siteUrl = getSiteUrl();
  const breadcrumb = breadcrumbSchema([
    { name: "Home", url: `${siteUrl}/` },
    { name: "Characters", url: `${siteUrl}/characters` },
  ]);

  return (
    <>
      <JsonLd data={breadcrumb} />
      {/* Same hero treatment as the rest of the site — keeps it unified. */}
      <FullBleedHero
        kicker="Characters"
        title="Meet the ScoutPaw pack"
        description={PAGE_DESCRIPTION}
      />

      {/* Stacked 100vh sticky scenes — each character pins to viewport, next
          slides over previous via z-index. Container must NOT have
          overflow-hidden or transform (those break sticky on descendants). */}
      <div className="relative">
        {ordered.map((character, i) => (
          <CharacterSection
            key={character.slug}
            character={character}
            theme={getCharacterTheme(character.slug)}
            channel={channelBy.get(character.slug)}
            flip={i % 2 === 1}
            priority={i === 0}
            index={i}
            total={ordered.length}
          />
        ))}
      </div>

      <div className="pt-24 md:pt-32">
        <ScrollReveal>
          <NewsletterCTA tag="characters-newsletter" />
        </ScrollReveal>
      </div>
    </>
  );
}
