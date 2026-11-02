"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Wraps a section/element with a fade-up entrance triggered when it enters the
 * viewport. Once revealed, stays revealed (no re-fade on scroll back).
 * Reduced-motion safe.
 *
 * `viewport.amount` is "some" (any part visible), NOT a fraction: a fraction
 * like 0.2 is *unreachable* on sections taller than ~5× the viewport (you can
 * never get 20% of them on screen at once), which left tall mobile sections —
 * e.g. the 1-column shop product grid — stuck at `opacity:0` forever.
 */
export function ScrollReveal({
  children,
  delay = 0,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  // `initial` must be identical on server + client — `useReducedMotion()` only
  // resolves client-side, so branching it here caused a hydration mismatch.
  // Reduced-motion is honoured via the (near-instant) transition instead.
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: "some" }}
      transition={reduce ? { duration: 0.01 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
