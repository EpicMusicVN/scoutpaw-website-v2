"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { CharacterAtmosphere } from "@/components/characters/character-atmosphere";
import { CharacterMerchCard } from "@/components/characters/character-merch-card";
import { CharacterMotif } from "@/components/characters/character-motif";
import type { Channel, Character, CharacterProduct } from "@/lib/content";
import type { CharacterTheme } from "@/lib/content/character-themes";
import { assetUrl } from "@/lib/utils/asset-url";

/**
 * Full-viewport character scene with layered scroll choreography. Each
 * `<section>` contributes `100vh` to page scroll height; the inner div is
 * `md:sticky md:top-0 md:h-screen` so the scene pins as the user scrolls.
 * `zIndex` is incremented per character so later scenes layer over earlier
 * ones — the "stacked paper" effect.
 *
 * On desktop, framer-motion tweens the inner div's scale + opacity tied to
 * two scroll progress ranges:
 *   - Entry: opacity fades 0 → 1.0 as the scene enters viewport (true fade-in)
 *   - Exit: scale 1 → 0.96 + opacity 1 → 0.85 as the scene leaves
 *   - Composite opacity = incoming × outgoing (multiplied)
 * Combined with a `mask-image` linear-gradient (top + bottom 12% fade to
 * transparent), adjacent scenes truly crossfade through each other's
 * feathered edges — no hard color cut at scene boundaries.
 * `useReducedMotion` short-circuits opacity ranges to flat 1.0 for users who
 * prefer no motion (mask stays — purely decorative).
 *
 * Mobile (<md): no sticky, no fixed height — scenes stack naturally and size
 * to content. Transforms still apply but read as natural scroll motion.
 */
export function CharacterSection({
  character,
  theme,
  channel,
  flip,
  priority,
  index,
}: {
  character: Character;
  theme: CharacterTheme;
  channel?: Channel;
  flip: boolean;
  priority: boolean;
  index: number;
  total: number;
}) {
  const { slug, name, breed, tagline, bio, poses, image, accentColor, products, merchCtaHref } =
    character;
  const pose = poses[0] ?? image;
  const hasTagline = !tagline.startsWith("TODO");

  const ref = useRef<HTMLElement | null>(null);
  const reduce = useReducedMotion();

  // Outgoing scene: subtle scale-down + fade as it leaves viewport. Skipped
  // entirely under prefers-reduced-motion.
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [1, 0.96]);
  const outgoingOpacity = useTransform(
    scrollYProgress,
    [0, 1],
    reduce ? [1, 1] : [1, 0.85],
  );

  // Incoming scene: fade in as it enters viewport. Tracks the entry window
  // (from "top touches viewport bottom" → "top touches viewport top").
  const { scrollYProgress: enterProgress } = useScroll({
    target: ref,
    offset: ["start end", "start start"],
  });
  const incomingOpacity = useTransform(
    enterProgress,
    [0, 1],
    reduce ? [1, 1] : [0, 1],
  );

  // Composite opacity = incoming × outgoing. Creates a crossfade window with
  // adjacent scenes; sticky phase between holds at 1.0.
  const opacity = useTransform(
    [incomingOpacity, outgoingOpacity],
    (values: number[]) => (values[0] ?? 1) * (values[1] ?? 1),
  );

  return (
    <section
      ref={ref}
      id={slug}
      aria-labelledby={`${slug}-name`}
      className="relative md:h-[100dvh]"
      style={{ zIndex: index }}
    >
      <motion.div
        style={{
          scale,
          opacity,
          backgroundColor: theme.surfaceTint,
          maskImage:
            "linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(180deg, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
        className="relative flex min-h-[100dvh] items-center overflow-hidden md:sticky md:top-0 md:h-[100dvh] md:min-h-0"
      >
        {/* Atmosphere/motif clipped to the scene by overflow-hidden above. */}
        <CharacterAtmosphere atmosphere={theme.atmosphere} color={theme.decor} />
        <CharacterMotif motif={theme.motif} color={theme.decor} />

        {/* Content grid — sits above atmosphere/motif via z-10. */}
        <div
          className={`relative z-10 mx-auto grid w-full max-w-hero items-center gap-8 px-4 py-12 md:grid-cols-2 md:gap-12 md:px-8 md:py-16 ${
            flip ? "md:[&>div:first-child]:order-2" : ""
          }`}
        >
          {/* Visual — pose fills its grid column's full width. No max-w cap
              and no dvh-height sizing — the pose stays as large as the column
              allows, with aspect-[3/4] preserving the portrait shape. Each
              character scene's `md:h-[100dvh]` host gives generous vertical
              room. Pose may extend below the initial fold on smaller laptops;
              the sticky scroll behavior keeps it in view as the user scrolls. */}
          <div className="relative mx-auto aspect-[3/4] w-full">
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-1/2 h-3/4 w-3/4 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
              style={{ backgroundColor: accentColor }}
            />
            <Image
              src={assetUrl(pose)}
              alt={`${name} the ${breed}`}
              fill
              priority={priority}
              sizes="(min-width: 768px) 560px, 80vw"
              className="object-contain object-bottom drop-shadow-[0_28px_50px_rgba(43,29,16,0.30)]"
            />
          </div>

          {/* Content — kicker, name (Plan A heading), tagline, bio, merch, CTAs. */}
          <div>
            <p
              className="font-display text-xs font-bold uppercase tracking-[0.28em] text-cobalt"
            >
              {breed}
            </p>
            <h2
              id={`${slug}-name`}
              className="mt-2 font-display text-4xl font-bold leading-[1.02] heading-sticker-honey md:text-5xl lg:text-6xl"
            >
              {name}
            </h2>
            {hasTagline && (
              <p className="mt-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink-blue/70">
                {tagline}
              </p>
            )}
            <p className="mt-4 max-w-prose text-base leading-relaxed text-ink-blue md:text-lg">
              {bio}
            </p>

            {/* Repurposed product cards — the two CharacterMerchCard slots that
                used to render individual products now point to the character's
                shop destination and YouTube channel. Same card visual language,
                new destinations. Each character section therefore exposes
                exactly two cards. */}
            {(() => {
              const shopCard: CharacterProduct | null = merchCtaHref
                ? {
                    id: `${slug}-shop-cta`,
                    title: `Shop ${name}'s Collection`,
                    image: products[0]?.image ?? image,
                    badge: "Shop",
                    ctaHref: merchCtaHref,
                  }
                : null;
              const youtubeCard: CharacterProduct | null = channel
                ? {
                    id: `${slug}-youtube-cta`,
                    title: `Watch ${channel.name} on YouTube`,
                    image: products[1]?.image ?? products[0]?.image ?? image,
                    badge: "YouTube",
                    ctaHref: channel.url,
                  }
                : null;
              const ctaCards = [shopCard, youtubeCard].filter(
                (c): c is CharacterProduct => c !== null,
              );
              return ctaCards.length > 0 ? (
                <ul className="mt-7 grid grid-cols-2 gap-4">
                  {ctaCards.map((card) => {
                    const isYoutube = card.id.endsWith("-youtube-cta");
                    return (
                      <li key={card.id}>
                        <CharacterMerchCard
                          product={card}
                          accentColor={accentColor}
                          ctaLabel={isYoutube ? "Watch now" : "Shop now"}
                          ariaActionVerb={isYoutube ? "Watch" : "Shop"}
                        />
                      </li>
                    );
                  })}
                </ul>
              ) : null;
            })()}

            <div className="mt-5">
              <Link
                href={`/characters/${slug}`}
                className="font-display text-sm font-semibold text-ink-blue underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink-blue/40"
              >
                Read {name}&rsquo;s full story &rarr;
              </Link>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
