"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Soft wobble on hover. Tuned calm (small angles, slow ease) to suit the
 * dual dog/parent audience — not the bouncy frenetic Bluey-kid feel.
 */
export function Wiggle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      whileHover={reduce ? undefined : { rotate: [0, -2, 2, -1, 1, 0], scale: 1.03 }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
