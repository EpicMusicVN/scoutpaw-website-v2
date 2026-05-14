import Image from "next/image";
import Link from "next/link";
import type { Playlist } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

/**
 * @deprecated Dropped from `/watch` in the 260511-1719 redesign — superseded by
 * `ExploreVideos` (filter chips + mixed grid). File kept dormant; safe to
 * delete once verified no other consumers exist. See
 * `plans/260511-1719-watch-redesign-and-compact-channels`.
 *
 * Three thematic playlists rendered as oversized sticker cards. Each card
 * carries the playlist accent color, a video-count badge, and a hover lift.
 * When `playlist.youtubeUrl` is set the card links externally; when absent it
 * renders disabled with a "Coming Soon" badge (the in-app flat library was
 * removed in the 260511 polish pass, so deep-linking has no destination
 * unless an external YouTube URL is provided).
 */
export function PlaylistGrid({ playlists }: { playlists: Playlist[] }) {
  if (playlists.length === 0) return null;

  return (
    <section className="mx-auto max-w-hero px-4 py-16 md:px-8 md:py-24">
      <header className="text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-brand-gold md:text-sm">
          Browse by Mood
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold text-ink md:text-5xl lg:text-6xl">
          Playlists for the Pack.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-warm-text md:text-lg">
          Hand-curated rotations — pick a vibe, press play, walk away.
        </p>
      </header>

      <ul className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
        {playlists.map((playlist, idx) => (
          <li key={playlist.id}>
            <PlaylistCard playlist={playlist} index={idx} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PlaylistCard({ playlist, index }: { playlist: Playlist; index: number }) {
  // Alternate slight rotation per tile so the row reads as a sticker board.
  const rotate = index % 2 === 0 ? "-rotate-1" : "rotate-1";
  const url = playlist.youtubeUrl;

  const baseClass = `group relative block overflow-hidden rounded-[2rem] shadow-cozy transition-all duration-300 ease-gentle ${rotate}`;
  const interactiveClass = `hover:rotate-0 hover:-translate-y-2 hover:shadow-cozy-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper`;
  const disabledClass = `cursor-default opacity-95`;
  const wrapperClass = `${baseClass} ${url ? interactiveClass : disabledClass}`;

  const inner = (
    <>
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <Image
          src={assetUrl(playlist.coverImage)}
          alt=""
          fill
          sizes="(min-width: 768px) 33vw, 100vw"
          className={`object-cover opacity-85 transition-transform duration-500 ease-out ${url ? "group-hover:scale-105" : ""}`}
          aria-hidden="true"
        />
        {/* Bottom shade for legibility */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/15 to-transparent"
        />
        {url ? (
          <span className="absolute right-4 top-4 rounded-full bg-surface/95 px-3 py-1 font-display text-xs font-bold uppercase tracking-[0.18em] text-ink/85 shadow-sm md:text-sm">
            {playlist.videoIds.length} videos
          </span>
        ) : (
          <span className="absolute right-4 top-4 rounded-full bg-ink/85 px-3 py-1 font-display text-[10px] font-bold uppercase tracking-[0.2em] text-surface md:text-xs">
            Coming Soon
          </span>
        )}
      </div>

      <div className="bg-surface px-6 py-6 md:px-7 md:py-7">
        <h3 className="font-display text-2xl font-bold text-ink md:text-3xl">
          {playlist.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm text-warm-text md:text-base">
          {playlist.description}
        </p>
        {url && (
          <span className="mt-4 inline-flex items-center gap-1.5 font-display text-sm font-semibold text-ink md:text-base">
            Open on YouTube
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        )}
      </div>
    </>
  );

  if (!url) {
    return (
      <div
        role="link"
        aria-disabled="true"
        aria-label={`${playlist.title} — Coming Soon`}
        className={wrapperClass}
        style={{
          background: `linear-gradient(135deg, ${playlist.accentColor} 0%, ${playlist.accentColor}cc 100%)`,
        }}
      >
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={wrapperClass}
      style={{
        background: `linear-gradient(135deg, ${playlist.accentColor} 0%, ${playlist.accentColor}cc 100%)`,
      }}
      aria-label={`Open the ${playlist.title} playlist on YouTube`}
    >
      {inner}
    </Link>
  );
}
