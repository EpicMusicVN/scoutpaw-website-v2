"use client";

import { motion } from "framer-motion";

/**
 * Per-route template — re-renders on every navigation.
 * Adds a soft fade-in transition between pages for premium feel.
 * Reduced-motion users get an instant render (Framer respects it via CSS).
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
