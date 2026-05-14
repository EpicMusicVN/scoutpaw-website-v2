"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { EmptyVideos } from "@/components/watch/empty-videos";
import { VideoCard } from "@/components/watch/video-card";
import type { Video, VideoContent } from "@/lib/content";
import { VIDEO_CONTENT_LABELS, VIDEO_CONTENTS } from "@/lib/content/schemas";

type Filter = VideoContent | "all";

/**
 * ExploreVideos — streaming-platform-style library section.
 * Filter chips row + horizontal scroll-snap rail (matches the Community
 * Choice rail UX). Client-state filter; no URL params (v1).
 */
export function ExploreVideos({
  videos,
  youtubeChannelUrl,
}: {
  videos: Video[];
  youtubeChannelUrl: string;
}) {
  const [active, setActive] = useState<Filter>("all");

  // Filter → sort (viewCount desc → featured tiebreak → uploadDate desc).
  const sorted = useMemo(() => {
    const filtered = active === "all" ? videos : videos.filter((v) => v.category === active);
    return [...filtered].sort((a, b) => {
      const va = a.viewCount ?? 0;
      const vb = b.viewCount ?? 0;
      if (vb !== va) return vb - va;
      if (b.featured !== a.featured) return Number(b.featured) - Number(a.featured);
      return (b.uploadDate ?? "").localeCompare(a.uploadDate ?? "");
    });
  }, [active, videos]);

  // Scroll-rail state — arrows hide at either end. Mirrors VideoRail.
  const trackRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const update = () => {
      setCanScrollLeft(el.scrollLeft > 4);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };
    // Reset to the start whenever the category changes so the new rail begins
    // fully scrolled left (intuitive UX after filter chip click).
    el.scrollTo({ left: 0 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [sorted]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.clientWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  return (
    <section
      id="explore"
      className="mx-auto max-w-hero scroll-mt-24 px-4 py-16 md:px-8 md:py-24"
    >
      <header className="text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm">
          The Library
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-5xl lg:text-6xl">
          Explore Videos.
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-base text-ink/85 md:text-lg">
          Pick a vibe — top viewed videos surface first.
        </p>
      </header>

      {/* Filter chips — `role="group"` + `aria-pressed` is the toggle-button
          group pattern; clicking re-renders the rail in place rather than
          swapping panels, so this is NOT a tablist. */}
      <div
        role="group"
        aria-label="Filter videos by category"
        className="mt-8 flex flex-wrap justify-center gap-2 md:mt-10 md:gap-3"
      >
        <FilterChip active={active === "all"} onClick={() => setActive("all")}>
          All
        </FilterChip>
        {VIDEO_CONTENTS.map((c) => (
          <FilterChip key={c} active={active === c} onClick={() => setActive(c)}>
            {VIDEO_CONTENT_LABELS[c]}
          </FilterChip>
        ))}
      </div>

      {sorted.length === 0 ? (
        <EmptyVideos />
      ) : (
        <>
          <div className="relative mt-10 md:mt-12">
            <NavArrow
              direction="left"
              visible={canScrollLeft}
              onClick={() => scrollByCard(-1)}
            />
            <NavArrow
              direction="right"
              visible={canScrollRight}
              onClick={() => scrollByCard(1)}
            />
            <ul
              ref={trackRef}
              className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:px-8"
              aria-label="Explore videos rail"
            >
              {sorted.map((v) => (
                <li
                  key={v.id ?? v.youtubeId}
                  className="w-[78%] shrink-0 snap-start sm:w-[44%] md:w-[32%] lg:w-[26%]"
                >
                  <VideoCard video={v} variant="default" />
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 flex justify-center md:mt-12">
            <Link
              href={youtubeChannelUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-shimmer inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-ink px-7 font-display text-base font-bold text-surface shadow-cozy-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cozy-lg"
            >
              See more on YouTube
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </>
      )}
    </section>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`inline-flex min-h-[40px] items-center rounded-full px-4 font-display text-sm font-semibold transition-all duration-150 md:px-5 md:text-base ${
        active
          ? "bg-ink text-surface shadow-sm"
          : "bg-surface text-ink/85 hover:bg-brand-primary/30 hover:text-ink"
      } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-paper`}
    >
      {children}
    </button>
  );
}

function NavArrow({
  direction,
  visible,
  onClick,
}: {
  direction: "left" | "right";
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={direction === "left" ? "Scroll left" : "Scroll right"}
      onClick={onClick}
      tabIndex={visible ? 0 : -1}
      className={`absolute top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink shadow-cozy-md transition-all duration-200 hover:scale-105 md:inline-flex ${
        direction === "left" ? "-left-1" : "-right-1"
      } ${visible ? "opacity-100" : "pointer-events-none opacity-0"}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={direction === "right" ? { transform: "rotate(180deg)" } : undefined}
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
