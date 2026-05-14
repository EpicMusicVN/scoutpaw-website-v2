"use client";

import { useEffect } from "react";
import { useScrollY } from "@/lib/hooks/use-scroll-y";

/**
 * Tiny client island: toggles `data-scrolled` on the parent <header> so its
 * Tailwind shadow utility kicks in. Kept separate so `top-nav.tsx` can stay
 * an async server component (reads site config + characters).
 */
export function TopNavScrollEffect() {
  const scrolled = useScrollY(8);

  useEffect(() => {
    const header = document.getElementById("site-nav");
    if (header) header.dataset.scrolled = scrolled ? "true" : "false";
  }, [scrolled]);

  return null;
}
