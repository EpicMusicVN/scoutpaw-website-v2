"use client";

import { useEffect, useState } from "react";

/**
 * Returns `true` once the page has scrolled past `threshold` pixels.
 * SSR-safe (returns `false` during render on the server / first client tick).
 * Uses a passive scroll listener and cleans up on unmount.
 *
 * Used by `top-nav.tsx` to apply a drop shadow once the user scrolls.
 */
export function useScrollY(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [threshold]);

  return scrolled;
}
