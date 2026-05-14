"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EmptyVideos } from "@/components/watch/empty-videos";
import { VideoCard } from "@/components/watch/video-card";
import type { Video } from "@/lib/content";

/**
 * Horizontal scroll rail for video cards. Native CSS scroll-snap (no JS
 * scroller library) with prev/next arrows that scroll one card-width at a
 * time. Arrows hide when at either end. On touch the user just swipes.
 */
export function VideoRail({
  title,
  kicker,
  videos,
  seeAllHref,
  seeAllLabel = "See all",
  channelLabel,
}: {
  title: string;
  kicker?: string;
  videos: Video[];
  seeAllHref?: string;
  seeAllLabel?: string;
  channelLabel?: string;
}) {
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
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [videos.length]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.clientWidth + 24 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  const isEmpty = videos.length === 0;

  return (
    <section className="mx-auto max-w-hero px-4 py-12 md:px-8 md:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {kicker && (
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm">
              {kicker}
            </p>
          )}
          <h2 className="mt-1.5 font-display text-3xl font-bold text-ink md:text-4xl lg:text-5xl">
            {title}
          </h2>
        </div>
        {!isEmpty && seeAllHref && (
          <Link
            href={seeAllHref}
            // External http(s) hrefs open in a new tab to match the broader
            // "watch elsewhere" convention; internal anchors (`#section`)
            // stay in-tab as normal scroll links.
            {...(/^https?:\/\//.test(seeAllHref)
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-ink hover:text-brand-gold md:text-base"
          >
            {seeAllLabel}
            <span aria-hidden="true">→</span>
          </Link>
        )}
      </header>

      {isEmpty ? (
        <EmptyVideos />
      ) : (
        /* Rail container — relative so the nav arrows can absolute-position. */
        <div className="relative mt-8">
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
            aria-label={title}
          >
            {videos.map((video) => (
              <li
                key={video.id ?? video.youtubeId}
                className="w-[78%] shrink-0 snap-start sm:w-[44%] md:w-[32%] lg:w-[26%]"
              >
                <VideoCard video={video} variant="default" channelLabel={channelLabel} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
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
