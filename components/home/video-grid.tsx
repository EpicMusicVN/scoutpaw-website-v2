import Link from "next/link";
import { VideoCard } from "@/components/watch/video-card";
import { content } from "@/lib/content";
import type { Video } from "@/lib/content";
import { enrichVideos } from "@/lib/youtube/enrich";

/**
 * Watch Together — 3-card preview of the latest videos with a see-all link
 * pointing to the full Watch page. Uses the canonical VideoCard so layout
 * stays consistent with the Watch page rails (rebuilt richer in Phase 4).
 */
export async function VideoGrid() {
  const rawVideos = await content.getVideos();
  const ready = rawVideos.filter((v) => !v.youtubeId.startsWith("TODO"));
  const config = await content.getSiteConfig();
  const youtube = config.social.find((s) => s.platform === "youtube");
  const youtubeUrl =
    youtube && !youtube.url.startsWith("TODO") ? youtube.url : "https://www.youtube.com";

  // Overlay live YouTube metadata (titles, thumbnails) onto the JSON fallback
  // so this section matches the Watch page rails. Server-side, 1hr cache.
  // Fall back to all videos when no real IDs are present so the layout still demos.
  const slice = (ready.length >= 3 ? ready : rawVideos).slice(0, 3);
  const featured: Video[] = await enrichVideos(slice);

  return (
    <section
      id="videos"
      className="mx-auto max-w-hero scroll-mt-24 px-4 py-24 md:px-8 md:py-32"
    >
      <header className="text-center">
        <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-cobalt md:text-sm">
          Watch Together
        </p>
        <h2 className="mt-3 font-display text-4xl font-bold heading-sticker-honey md:text-6xl lg:text-7xl">
          Peace. Play. Playback.
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-ink-blue/85 md:text-lg">
          Switch on ScoutPaw TV - soothing rhythms and cozy colors crafted to keep your best friend company.
        </p>
      </header>

      <ul className="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
        {featured.map((video) => (
          <li key={video.youtubeId}>
            <VideoCard video={video} channelLabel="@ScoutPawTV" />
          </li>
        ))}
      </ul>

      <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/watch"
          className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-ink px-7 font-display text-base font-semibold text-surface transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cozy-md"
        >
          DIVE INTO THE LIBRARY
          <span aria-hidden="true">→</span>
        </Link>
        <Link
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 font-display text-base font-semibold text-ink-blue hover:text-brand-gold"
        >
          Join the pack on YouTube
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
