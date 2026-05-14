"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type { Character, Playlist, Video } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";
import { cn } from "@/lib/utils/cn";

type Filter = "all" | string;

const videoKey = (v: Video): string => v.id ?? v.youtubeId;

/**
 * @deprecated Removed from `/watch` in the 260511 polish pass (Watch now
 * routes to external YouTube via PlaylistGrid). Kept temporarily; safe to
 * delete once no references remain. See plans/260511-0205-cinematic-hero-and-layout-polish.
 *
 * Full-library video grid w/ character chips + URL-driven playlist filter.
 * The playlist filter is the entry point used by `<PlaylistGrid>` cards
 * (`?playlist=ID#library`); when active, it scopes the visible set BEFORE the
 * character chips apply. A "Clear playlist" link removes the URL param.
 */
export function WatchLibrary({
  videos,
  characters,
  playlists = [],
}: {
  videos: Video[];
  characters: Character[];
  playlists?: Playlist[];
}) {
  const searchParams = useSearchParams();
  const [active, setActive] = useState<Filter>("all");
  const [activePlaylistId, setActivePlaylistId] = useState<string | null>(null);

  // Sync playlist filter from URL on mount + whenever the param changes.
  useEffect(() => {
    const id = searchParams.get("playlist");
    setActivePlaylistId(id && id.length > 0 ? id : null);
  }, [searchParams]);

  const activePlaylist = useMemo(
    () => playlists.find((p) => p.id === activePlaylistId) ?? null,
    [activePlaylistId, playlists],
  );

  // Apply playlist filter first (URL-driven), then chip filter (local state).
  const playlistScoped = useMemo(() => {
    if (!activePlaylist) return videos;
    const ids = new Set(activePlaylist.videoIds);
    return videos.filter((v) => ids.has(videoKey(v)));
  }, [videos, activePlaylist]);

  // Count videos per character WITHIN the playlist scope.
  const counts = useMemo(() => {
    const map = new Map<string, number>();
    map.set("all", playlistScoped.length);
    for (const c of characters) {
      const n = playlistScoped.filter((v) => v.characterSlugs.includes(c.slug)).length;
      map.set(c.slug, n);
    }
    return map;
  }, [playlistScoped, characters]);

  const filtered = useMemo(() => {
    if (active === "all") return playlistScoped;
    return playlistScoped.filter((v) => v.characterSlugs.includes(active));
  }, [active, playlistScoped]);

  return (
    <section className="mx-auto max-w-hero px-4 py-10 md:px-8 md:py-14">
      {/* Active playlist banner — shown only when ?playlist= is set */}
      {activePlaylist && (
        <div className="mx-auto mb-8 flex max-w-3xl flex-wrap items-center justify-between gap-3 rounded-full border border-ink/10 bg-surface px-5 py-3 shadow-cozy md:px-7">
          <p className="font-display text-sm font-bold text-ink md:text-base">
            <span className="opacity-65">Playlist:</span> {activePlaylist.title}
          </p>
          <Link
            href="#library"
            scroll={false}
            className="inline-flex items-center gap-1.5 font-display text-sm font-semibold text-ink hover:text-brand-gold"
          >
            Clear
            <span aria-hidden="true">×</span>
          </Link>
        </div>
      )}

      {/* Character filter chips */}
      <ul className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
        <FilterChip
          label="All"
          count={counts.get("all") ?? 0}
          isActive={active === "all"}
          onClick={() => setActive("all")}
        />
        {characters.map((c) => {
          const n = counts.get(c.slug) ?? 0;
          return (
            <FilterChip
              key={c.slug}
              label={c.name}
              count={n}
              isActive={active === c.slug}
              disabled={n === 0}
              onClick={() => setActive(c.slug)}
            />
          );
        })}
      </ul>

      {/* Video grid or empty state */}
      <div className="mt-10">
        {filtered.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-[2rem] border border-ink/10 bg-surface p-10 text-center shadow-cozy">
            <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">
              No episodes here yet.
            </h2>
            <p className="mt-3 text-ink/85">
              Try another filter or clear the playlist to see the full library.
            </p>
            <button
              type="button"
              onClick={() => setActive("all")}
              className="mt-6 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-ink hover:text-brand-gold"
            >
              Reset character filter
              <span aria-hidden="true">→</span>
            </button>
          </div>
        ) : (
          <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((video) => {
              const characterTags = characters.filter((c) =>
                video.characterSlugs.includes(c.slug),
              );
              return (
                <li key={videoKey(video)}>
                  <Link
                    href={`https://www.youtube.com/watch?v=${video.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block overflow-hidden rounded-[1.5rem] border border-ink/10 bg-surface shadow-cozy transition-all duration-300 ease-gentle hover:-translate-y-1 hover:shadow-cozy-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
                    aria-label={`Watch ${video.title} on YouTube`}
                  >
                    <div
                      className="relative aspect-video w-full bg-cover bg-center"
                      style={{
                        backgroundImage: `url(${
                          video.thumbnail
                            ? assetUrl(video.thumbnail)
                            : video.youtubeId.startsWith("TODO")
                              ? assetUrl("banner/banner.png")
                              : `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`
                        })`,
                      }}
                    >
                      <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-200 group-hover:bg-ink/30">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-coral text-white shadow-cozy-md transition-transform duration-200 group-hover:scale-110">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                      {video.duration && (
                        <span className="absolute bottom-2 right-2 rounded-full bg-ink/80 px-2 py-0.5 font-display text-[0.65rem] font-semibold text-surface md:text-xs">
                          {video.duration}
                        </span>
                      )}
                    </div>
                    <div className="p-5">
                      {characterTags.length > 0 && (
                        <ul className="mb-2 flex flex-wrap gap-1.5">
                          {characterTags.slice(0, 3).map((c) => (
                            <li
                              key={c.slug}
                              className="rounded-full bg-paper px-2 py-0.5 text-[0.65rem] font-medium text-ink/75"
                              style={{
                                boxShadow: `inset 0 -2px 0 ${c.accentColor}`,
                              }}
                            >
                              {c.name}
                            </li>
                          ))}
                        </ul>
                      )}
                      <h3 className="line-clamp-2 font-display text-base font-semibold leading-tight text-ink md:text-lg">
                        {video.title}
                      </h3>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}

function FilterChip({
  label,
  count,
  isActive,
  disabled = false,
  onClick,
}: {
  label: string;
  count: number;
  isActive: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className={cn(
          "inline-flex min-h-[40px] items-center gap-2 rounded-full border px-4 py-2 font-display text-sm font-semibold transition-all duration-150",
          isActive
            ? "border-ink bg-ink text-surface shadow-cozy"
            : disabled
              ? "border-ink/10 bg-surface text-ink/40 cursor-not-allowed"
              : "border-ink/15 bg-surface text-ink hover:border-ink/30 hover:bg-brand-primary/30",
        )}
      >
        {label}
        <span
          className={cn(
            "rounded-full px-1.5 py-0.5 text-[0.65rem] font-bold",
            isActive ? "bg-surface/20 text-surface" : "bg-ink/10 text-ink/70",
          )}
        >
          {count}
        </span>
      </button>
    </li>
  );
}
