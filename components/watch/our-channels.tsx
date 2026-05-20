"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { Channel, Character, Video } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

function formatSubs(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return String(n);
}

function YouTubeMark() {
  return (
    <svg width="14" height="10" viewBox="0 0 28 20" aria-hidden="true">
      <rect x="0" y="0" width="28" height="20" rx="5" fill="#FF0000" />
      <path d="M11 6 L11 14 L18 10 Z" fill="#ffffff" />
    </svg>
  );
}

/**
 * The Network / Our Channels — compact horizontal scroll rail.
 * 220-260px cards display 5-6 channels at 1440px without dominating the page.
 * Native scroll-snap for swipe; chevron buttons appear on desktop when more
 * cards exist off-screen. Click a card → opens that channel on YouTube.
 *
 * Section anchor `id="channels"` is the scroll target for WatchHero's
 * "Join ScoutPaw World!" CTA.
 */
export function OurChannels({
  channels,
  characters,
  videos,
}: {
  channels: Channel[];
  characters: Character[];
  videos: Video[];
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
  }, [channels.length]);

  const scrollByCard = (direction: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector("li");
    const step = card ? card.clientWidth + 16 : el.clientWidth * 0.8;
    el.scrollBy({ left: step * direction, behavior: "smooth" });
  };

  // Cap the rail at the first 5 channels — keeps the section feeling curated
  // rather than overcrowded if more entries are added later.
  const visibleChannels = channels.slice(0, 5);
  if (visibleChannels.length === 0) return null;
  const charById = new Map(characters.map((c) => [c.slug, c]));
  const videoById = new Map(videos.map((v) => [v.id ?? v.youtubeId, v]));

  return (
    <section
      id="channels"
      className="mx-auto max-w-hero scroll-mt-24 px-4 py-16 md:px-8 md:py-20"
    >
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm">
            The Network
          </p>
          <h2 className="mt-1.5 font-display text-3xl font-bold text-ink md:text-4xl lg:text-5xl">
            Our Channels.
          </h2>
        </div>
      </header>

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
          className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-12 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:-mx-8 md:gap-5 md:px-16 lg:mx-0 lg:grid lg:grid-cols-5 lg:gap-5 lg:overflow-visible lg:px-0 lg:pb-0 lg:snap-none"
          aria-label="ScoutPaw channels"
        >
          {visibleChannels.map((channel) => {
            const character = charById.get(channel.characterSlug) ?? null;
            const latestVideo = channel.latestVideoId
              ? videoById.get(channel.latestVideoId) ?? null
              : null;
            return (
              <li
                key={channel.slug}
                className="w-[220px] shrink-0 snap-start md:w-[240px] lg:w-auto lg:shrink lg:snap-align-none"
              >
                <CompactChannelCard
                  channel={channel}
                  character={character}
                  latestVideo={latestVideo}
                />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

function CompactChannelCard({
  channel,
  character,
  latestVideo,
}: {
  channel: Channel;
  character: Character | null;
  latestVideo: Video | null;
}) {
  const latestThumb = latestVideo
    ? latestVideo.thumbnail
      ? assetUrl(latestVideo.thumbnail)
      : latestVideo.youtubeId.startsWith("TODO")
        ? assetUrl("banner/banner.png")
        : `https://i.ytimg.com/vi/${latestVideo.youtubeId}/hqdefault.jpg`
    : null;

  return (
    <Link
      href={channel.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface shadow-cozy transition-all duration-300 ease-gentle hover:-translate-y-1 hover:shadow-cozy-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
      aria-label={`Visit ${channel.name} on YouTube`}
    >
      {/* Banner block + character peek */}
      <div
        className="relative h-24 w-full overflow-hidden"
        style={{
          background: channel.bannerColor
            ? `linear-gradient(135deg, ${channel.bannerColor} 0%, ${channel.bannerColor}cc 100%)`
            : "linear-gradient(135deg, var(--bg-warm-tan) 0%, var(--bg-peach) 100%)",
        }}
      >
        {character && (
          <div className="pointer-events-none absolute -bottom-2 -right-2 h-24 w-24 transition-transform duration-500 ease-out group-hover:scale-105">
            <Image
              src={assetUrl(character.image)}
              alt=""
              fill
              sizes="96px"
              className="object-contain drop-shadow-[0_8px_16px_rgba(43,29,16,0.15)]"
            />
          </div>
        )}
      </div>

      {/* Body: avatar circle overlaps banner edge */}
      <div className="relative flex flex-1 flex-col p-4">
        {channel.avatarUrl ? (
          <span
            aria-hidden="true"
            className="absolute -top-6 left-4 h-12 w-12 overflow-hidden rounded-full bg-surface shadow-cozy"
          >
            <Image
              src={channel.avatarUrl}
              alt=""
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </span>
        ) : (
          <span
            aria-hidden="true"
            className="absolute -top-6 left-4 flex h-12 w-12 items-center justify-center rounded-full font-display text-lg font-bold text-ink shadow-cozy"
            style={{
              background: channel.bannerColor
                ? `linear-gradient(135deg, ${channel.avatarColor ?? channel.bannerColor} 0%, ${channel.bannerColor} 100%)`
                : "linear-gradient(135deg, var(--bg-warm-tan) 0%, var(--bg-peach) 100%)",
            }}
          >
            {channel.name.charAt(0)}
          </span>
        )}

        <div className="mt-6">
          <h3 className="line-clamp-1 font-display text-base font-bold text-ink">
            {channel.name}
          </h3>
          <p className="mt-0.5 text-xs text-ink/65">
            {formatSubs(channel.subscriberCount)} subs
          </p>
        </div>

        {latestThumb && (
          <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={latestThumb}
              alt=""
              fill
              sizes="240px"
              className="object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
            />
            {latestVideo?.duration && (
              <span className="absolute bottom-1.5 right-1.5 rounded-full bg-ink/85 px-2 py-0.5 font-display text-[0.6rem] font-semibold text-surface">
                {latestVideo.duration}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex justify-end">
          <span className="inline-flex min-h-[32px] items-center gap-1.5 rounded-full bg-ink px-3 font-display text-xs font-bold text-surface transition-transform duration-200 group-hover:translate-x-0.5">
            <YouTubeMark />
            Subscribe
          </span>
        </div>
      </div>
    </Link>
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
      aria-label={direction === "left" ? "Scroll channels left" : "Scroll channels right"}
      onClick={onClick}
      tabIndex={visible ? 0 : -1}
      className={`absolute top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-surface text-ink shadow-cozy-md transition-all duration-200 hover:scale-105 lg:hidden ${
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
