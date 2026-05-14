"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Character } from "@/lib/content";

/**
 * Hero right-zone media — Buddy front-and-center with one supporting pup
 * peeking from behind. Subtle Y offset between layers gives depth without
 * a heavy parallax load. Float animations only fire after hydration so SSR
 * markup matches client-rendered output (avoids a flash on reduced-motion).
 */
export function HeroCharacterCluster({
  primary,
  supporting,
}: {
  primary: Character;
  supporting: Character | null;
}) {
  const reduce = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const animate = mounted && !reduce;
  const float = animate ? { y: [0, -10, 0] } : undefined;

  return (
    <div className="relative h-full w-full">
      {/* Soft accent glow behind primary */}
      <div
        aria-hidden="true"
        className="absolute inset-x-1/2 bottom-1/4 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl md:h-96 md:w-96"
        style={{ backgroundColor: primary.accentColor, opacity: 0.42 }}
      />

      {/* Supporting pup — back layer, slightly smaller, offset right */}
      {supporting && (
        <motion.div
          className="absolute right-[6%] top-[14%] h-[55%] w-[55%] md:right-0 md:top-[12%]"
          animate={float}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <Image
            src={supporting.image}
            alt={`${supporting.name} the ${supporting.breed}`}
            fill
            sizes="(min-width: 768px) 30vw, 45vw"
            className="object-contain opacity-90 drop-shadow-[0_18px_36px_rgba(43,29,16,0.18)]"
          />
        </motion.div>
      )}

      {/* Primary pup — front layer, larger, slight inverse float. Single LCP image. */}
      <motion.div
        className="absolute inset-0"
        animate={animate ? { y: [0, 8, 0] } : undefined}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
      >
        <Image
          src={primary.image}
          alt={`${primary.name} the ${primary.breed}`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-contain drop-shadow-[0_28px_56px_rgba(43,29,16,0.22)]"
          priority
        />
      </motion.div>
    </div>
  );
}
