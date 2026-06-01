"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Wraps a section/element with a fade-up entrance triggered when 20% in view.
 * Once revealed, stays revealed (no re-fade on scroll back). Reduced-motion safe.
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
      viewport={{ once: true, amount: 0.2 }}
      transition={reduce ? { duration: 0.01 } : { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
