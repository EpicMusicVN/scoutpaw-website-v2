import Image from "next/image";
import { CharacterAtmosphere } from "@/components/characters/character-atmosphere";
import { CharacterChannelBadge } from "@/components/characters/character-channel-badge";
import { CharacterMotif } from "@/components/characters/character-motif";
import type { Channel, Character } from "@/lib/content";
import type { CharacterTheme } from "@/lib/content/character-themes";
import { assetUrl } from "@/lib/utils/asset-url";

/**
 * Full-bleed themed hero for a character detail page. The per-character theme
 * drives the gradient backdrop, the signature atmospheric layer + decorative
 * motif; copy stays `ink` on the light gradient so contrast holds (AA). Big
 * character image; stacks on mobile with the image first. When a `channel` is
 * supplied, an integrated YouTube badge sits below the subtitle.
 */
export function CharacterDetailHero({
  character,
  theme,
  channel,
}: {
  character: Character;
  theme: CharacterTheme;
  channel?: Channel | null;
}) {
  const { name, breed, tagline, image, poses } = character;
  const heroImage = poses[0] ?? image;

  return (
    <section
      className="relative overflow-hidden"
      style={{ background: theme.heroGradient }}
    >
      {/* Signature atmosphere sits behind the motif scatter + all copy. */}
      <CharacterAtmosphere atmosphere={theme.atmosphere} color={theme.decor} />
      <CharacterMotif motif={theme.motif} color={theme.decor} />

      <div className="relative mx-auto grid max-w-5xl items-center gap-8 px-4 py-16 md:grid-cols-2 md:gap-12 md:px-8 md:py-24">
        <div className="order-2 text-center md:order-1 md:text-left">
          <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-cobalt">
            {breed}
          </p>
          <h1
            className="mt-2 font-display text-4xl font-bold leading-[1.0] heading-sticker-honey md:text-6xl"
          >
            Say hi to {name}
          </h1>
          {!tagline.startsWith("TODO") && (
            <p className="mt-4 font-display text-sm font-semibold uppercase tracking-[0.15em] text-ink-blue/70 md:text-base">
              {tagline}
            </p>
          )}
          {channel && (
            <CharacterChannelBadge channel={channel} decor={theme.decor} />
          )}
        </div>

        <div className="relative order-1 mx-auto aspect-square w-full max-w-[420px] md:order-2">
          <Image
            src={assetUrl(heroImage)}
            alt={`${name} the ${breed}`}
            fill
            sizes="(min-width: 768px) 420px, 80vw"
            priority
            className="object-contain drop-shadow-[0_24px_48px_rgba(43,29,16,0.22)]"
          />
        </div>
      </div>
    </section>
  );
}
