"use client";

import { motion, useReducedMotion } from "framer-motion";
import { durations, easings } from "@/lib/theme/tokens";

export function Stagger({
  children,
  gap = 0.08,
  className,
}: {
  children: React.ReactNode;
  /** Delay between items in seconds. */
  gap?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduce ? 0 : gap,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: reduce ? 0 : 16 },
        show: {
          opacity: 1,
          y: 0,
          transition: {
            duration: reduce ? 0.01 : durations.base,
            ease: easings.gentle,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
