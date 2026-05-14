"use client";

import { motion, useScroll, useSpring } from "framer-motion";

/**
 * Thin warm-gold progress bar at the very top of the viewport.
 * Tracks document scroll. Spring-smoothed for natural motion.
 */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.4,
  });

  return (
    <motion.div
      style={{ scaleX, transformOrigin: "0% 50%" }}
      className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[3px] bg-gradient-to-r from-brand-gold via-brand-primary to-brand-primary"
      aria-hidden="true"
    />
  );
}
