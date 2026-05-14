"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AtmosphereLayer } from "@/components/ui/atmosphere-layer";
import { Button } from "@/components/ui/button";

/**
 * Two-zone cinematic hero.
 * Left: text panel on a honey sticker — never overlaps the media. Right:
 * media slot, supplied by the caller (`media` prop) or a fallback image.
 * Subtle scroll parallax translates the media on desktop; mobile stacks the
 * zones vertically with characters above text and no parallax.
 *
 * Used by both Home (with character cluster media) and Shop (with image).
 */
export function CinematicHero({
  kicker,
  title,
  description,
  actions,
  media,
  image,
  imageAlt = "ScoutPaw",
  objectPosition = "center center",
  atmosphereVariant = "honey",
}: {
  kicker: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
  /** Right-zone media slot. If omitted, falls back to <image>. */
  media?: React.ReactNode;
  image?: string;
  imageAlt?: string;
  objectPosition?: string;
  /** Atmosphere palette — honey (default, home), peach (shop), sky/sage. */
  atmosphereVariant?: "honey" | "peach" | "sky" | "sage" | "warm-tan";
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  // Parallax fires only after hydration so SSR + first-paint don't mismatch.
  const yMedia = useTransform(scrollYProgress, [0, 1], [0, mounted && !reduce ? -60 : 0]);

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden bg-paper"
    >
      <AtmosphereLayer variant={atmosphereVariant} density="med" />

      <div className="relative mx-auto grid max-w-hero items-center gap-8 px-4 pb-16 pt-10 md:grid-cols-[1.05fr_1fr] md:gap-12 md:px-8 md:pb-24 md:pt-16 lg:gap-16 lg:pb-28 lg:pt-20">
        {/* MEDIA — order-1 mobile (above text), order-2 desktop (right). */}
        <motion.div
          className="relative order-1 aspect-square w-full md:order-2 md:aspect-auto md:h-[540px] lg:h-[620px]"
          style={{ y: yMedia }}
        >
          {media ?? (
            image && (
              <Image
                src={image}
                alt={imageAlt}
                fill
                priority
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain"
                style={{ objectPosition }}
              />
            )
          )}
        </motion.div>

        {/* TEXT PANEL — sticker treatment, oversized type. Animation gated on
            `mounted` so SSR markup matches first paint and reduced-motion
            users don't see a flash. */}
        <motion.div
          initial={mounted ? { opacity: 0, y: 16 } : false}
          animate={mounted ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative order-2 rounded-[2.5rem] border border-ink/10 bg-surface p-7 shadow-cozy-xl md:order-1 md:p-10 lg:p-12"
        >
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-warm-muted md:text-sm">
            {kicker}
          </p>
          <h1 className="mt-3 font-display text-5xl font-bold leading-[0.98] text-ink md:text-6xl lg:text-7xl xl:text-[5rem]">
            {title}
          </h1>
          <p className="mt-5 max-w-md text-base text-ink/85 md:text-lg lg:text-xl">
            {description}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            {actions ?? (
              <>
                <Button href="/watch" size="lg" variant="dark">
                  Watch Now
                </Button>
                <Button href="#meet-the-pack" size="lg" variant="outline">
                  Meet the Pack
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
