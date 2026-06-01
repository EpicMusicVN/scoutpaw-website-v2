import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Channel, Video } from "@/lib/content";
import { VIDEO_CONTENT_LABELS } from "@/lib/content/schemas";
import { assetUrl } from "@/lib/utils/asset-url";
import { HeroVideo } from "./hero-video";

/**
 * WatchHero — cinematic above-the-fold for /watch.
 * Featured video fills the content width (max-w-hero). Stacked kicker / h1 /
 * description / CTAs sit centered below. Two character poses flank the text
 * block on xl+ (sit beside the centered max-w-2xl text without overlap).
 */
export function WatchHero({
  featured,
  channel,
  youtubeChannelUrl,
}: {
  featured: Video;
  channel?: Channel | null;
  youtubeChannelUrl: string;
}) {
  const isPlaceholder = featured.youtubeId.startsWith("TODO");
  const thumbnail = featured.thumbnail
    ? assetUrl(featured.thumbnail)
    : isPlaceholder
      ? assetUrl("banner/banner.png")
      : `https://i.ytimg.com/vi/${featured.youtubeId}/maxresdefault.jpg`;
  const videoHref = isPlaceholder
    ? youtubeChannelUrl
    : `https://www.youtube.com/watch?v=${featured.youtubeId}`;

  return (
    <section className="relative isolate overflow-hidden bg-paper">
      <div className="mx-auto max-w-hero px-4 py-12 md:px-8 md:py-16">

        {/* Featured video — full content width, aspect-video */}
        <Link
          href={videoHref}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-[2rem] border border-ink/10 shadow-cozy-md transition-all duration-300 ease-gentle hover:-translate-y-1 hover:shadow-cozy-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
          aria-label={`Watch ${featured.title} on YouTube`}
        >
          <div className="relative aspect-video w-full">
            {featured.videoSrc ? (
              <HeroVideo
                src={assetUrl(featured.videoSrc)}
                poster={featured.videoPoster ? assetUrl(featured.videoPoster) : undefined}
                title={featured.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <Image
                src={thumbnail}
                alt=""
                fill
                priority
                sizes="(min-width: 1024px) 1400px, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            {/* Play-button overlay — only when the inline <video> isn't doing
                the heavy lifting (i.e., we're falling back to a YouTube thumb). */}
            {!featured.videoSrc && (
              <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-200 group-hover:bg-ink/30">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-coral text-white shadow-cozy-lg transition-transform duration-200 group-hover:scale-110 md:h-28 md:w-28">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
            {featured.category && (
              <span className="absolute left-4 top-4 rounded-full bg-brand-primary/95 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-ink-blue md:text-sm">
                {VIDEO_CONTENT_LABELS[featured.category]}
              </span>
            )}
            {channel && (
              <span className="absolute bottom-4 left-4 rounded-full bg-surface/90 px-3 py-1.5 font-display text-xs font-bold text-ink-blue shadow-sm md:text-sm">
                {channel.name}
              </span>
            )}
          </div>
        </Link>

        {/* Stacked text + flanking poses below video. Bottom padding scales
            with pose size at xl+ so the full body fits inside the section's
            overflow-hidden bounds (poses are anchored top-4 and would clip). */}
        <div className="relative mt-10 md:mt-12 pb-20 xl:pb-32 2xl:pb-40">
          {/* Left flank pose — xl+ only, larger at 2xl */}
          <Image
            src={assetUrl("characters-position/husky1.png")}
            alt=""
            aria-hidden
            width={320}
            height={180}
            className="pointer-events-none absolute left-4 top-4 hidden h-auto w-56 -rotate-6 xl:block 2xl:w-72"
          />
          {/* Right flank pose */}
          <Image
            src={assetUrl("characters-position/corgi2.png")}
            alt=""
            aria-hidden
            width={320}
            height={180}
            className="pointer-events-none absolute right-4 top-4 hidden h-auto w-56 rotate-6 xl:block 2xl:w-72"
          />

          {/* Centered text + CTAs — direct on cyan body bg (light surface) */}
          <div className="mx-auto max-w-2xl text-center">
            <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-cobalt md:text-sm">
              ScoutPaw TV
            </p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.02] heading-sticker-honey md:text-5xl lg:text-6xl">
              Tune in to the Pack.
            </h1>
            <p className="mx-auto mt-4 max-w-md text-base text-ink-blue/85 md:text-lg">
              Keep your furry friend happy with calming visuals and scientifically proven sounds. Just tap a journey to start their YouTube session!
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button href="#channels" size="lg" variant="dark">
                Join ScoutPaw World!
              </Button>
              <Button
                href={youtubeChannelUrl}
                size="lg"
                variant="outline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Watch on YouTube
              </Button>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
