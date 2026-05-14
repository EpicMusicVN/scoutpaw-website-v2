"use client";

import { motion, useReducedMotion } from "framer-motion";
import { durations, easings } from "@/lib/theme/tokens";

type Direction = "up" | "down" | "none";

const offset: Record<Direction, number> = {
  up: 16,
  down: -16,
  none: 0,
};

export function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const y = reduce ? 0 : offset[direction];
  const duration = reduce ? 0.01 : durations.base;

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration, delay, ease: easings.gentle }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
