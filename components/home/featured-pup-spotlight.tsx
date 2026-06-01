import Image from "next/image";
import { Button } from "@/components/ui/button";
import { content } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

/**
 * Meet Rocky — full-bleed storytelling banner for the home page mascot.
 * Warm-tan → honey → peach gradient with sun-ray decorative SVG behind Rocky
 * and a quote-style pull from his fun facts. Section curves on top + bottom
 * give the section atmospheric continuity with the cream sections it sits between.
 */
export async function FeaturedPupSpotlight() {
  const characters = await content.getCharacters();
  const max = characters.find((c) => c.slug === "max") ?? characters[0];
  if (!max) return null;

  const quote = max.quote;

  return (
    <section className="relative mx-auto max-w-hero scroll-mt-24 px-4 py-12 md:px-8 md:py-16">
      <div
        className="relative overflow-hidden rounded-[2.5rem] border border-ink/10 px-4 py-20 shadow-cozy-md md:px-12 md:py-28"
        style={{
          background:
            "linear-gradient(135deg, var(--bg-warm-tan) 0%, var(--brand-primary) 50%, var(--bg-peach) 100%)",
        }}
      >
        <SunRays />

        <div className="relative mx-auto grid items-center gap-10 md:grid-cols-[1fr_1.1fr] md:gap-16">
          {/* Copy block */}
          <div className="relative z-10 order-2 md:order-1">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-ink-blue/70 md:text-sm">
              MEET THE PACK LEADER
            </p>
            <h2 className="mt-3 font-display text-4xl font-bold leading-[0.95] heading-sticker-honey md:whitespace-nowrap md:text-6xl lg:text-7xl">
              Say hi to <span className="text-brand-gold">Max</span>
            </h2>
            <p className="mt-2 font-display text-lg tracking-wide text-ink-blue/70 md:text-xl">
              The soulful, golden heart of ScoutPaw
            </p>
            <p className="mt-6 max-w-md text-base text-ink-blue/85 md:text-lg lg:text-xl">
              {max.bio}
            </p>

            {quote && (
              <blockquote className="relative mt-8 max-w-md rounded-3xl border-l-4 border-brand-gold bg-surface/70 p-5 backdrop-blur-sm md:p-6">
                <p className="font-display text-base italic text-ink-blue md:text-lg">
                  &ldquo;{quote}&rdquo;
                </p>
              </blockquote>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              <Button href={`/characters/${max.slug}`} size="lg" variant="dark">
                Meet {max.name}
              </Button>
              <Button href="#meet-the-pack" size="lg" variant="outline">
                Meet the rest
              </Button>
            </div>
          </div>

          {/* Pack Leader — oversized, glow behind */}
          <div className="relative order-1 aspect-square w-full md:order-2 md:aspect-auto md:min-h-[560px]">
            <div
              aria-hidden="true"
              className="absolute inset-x-1/2 bottom-1/3 -z-10 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl md:h-96 md:w-96"
              style={{ backgroundColor: max.accentColor, opacity: 0.45 }}
            />
            <Image
              src={assetUrl(max.image)}
              alt={`${max.name} the ${max.breed}`}
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-contain drop-shadow-[0_28px_56px_rgba(43,29,16,0.22)]"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Decorative sun-ray pattern behind the mascot. Positioned absolutely behind
 * the image, soft opacity, never blocks content.
 */
function SunRays() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 h-full w-full opacity-25"
      viewBox="0 0 1440 800"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="sun-rays-grad" cx="0.7" cy="0.5" r="0.7">
          <stop offset="0%" stopColor="#fff5d6" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#fff5d6" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="1010" cy="400" r="500" fill="url(#sun-rays-grad)" />
      {Array.from({ length: 14 }).map((_, i) => {
        const angle = (i * 360) / 14;
        return (
          <line
            key={i}
            x1="1010"
            y1="400"
            x2="1010"
            y2="-200"
            stroke="#fff5d6"
            strokeWidth="14"
            strokeLinecap="round"
            opacity="0.35"
            transform={`rotate(${angle} 1010 400)`}
          />
        );
      })}
    </svg>
  );
}
