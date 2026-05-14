import Image from "next/image";
import Link from "next/link";
import type { Channel, Video } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

/**
 * @deprecated Folded into `WatchHero` in the 260511-1719 plan. The /watch
 * page no longer renders this directly. File kept dormant for safe removal
 * once verified no other consumers exist. See
 * `plans/260511-1719-watch-redesign-and-compact-channels`.
 *
 * Featured Video — large hero card sitting at the top of the Watch page.
 * 60/40 split: oversized thumbnail w/ play overlay on the left, copy + meta
 * + CTA on the right. Renders only when a featured video exists; the page
 * skips this section otherwise.
 */
export function FeaturedVideo({
  video,
  channel,
}: {
  video: Video;
  channel?: Channel | null;
}) {
  const isPlaceholder = video.youtubeId.startsWith("TODO");
  const thumbnail = video.thumbnail
    ? assetUrl(video.thumbnail)
    : isPlaceholder
      ? assetUrl("banner/banner.png")
      : `https://i.ytimg.com/vi/${video.youtubeId}/maxresdefault.jpg`;
  const href = isPlaceholder
    ? "https://www.youtube.com"
    : `https://www.youtube.com/watch?v=${video.youtubeId}`;

  return (
    <section className="mx-auto max-w-hero px-4 pb-12 pt-6 md:px-8 md:pb-16 md:pt-10">
      <div className="grid items-stretch gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-10">
        {/* Thumbnail card */}
        <Link
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative block overflow-hidden rounded-[2rem] border border-ink/10 shadow-cozy-md transition-all duration-300 ease-gentle hover:-translate-y-1 hover:shadow-cozy-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-4 focus-visible:ring-offset-paper"
          aria-label={`Watch ${video.title} on YouTube`}
        >
          <div className="relative aspect-video w-full">
            <Image
              src={thumbnail}
              alt=""
              fill
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
            <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-200 group-hover:bg-ink/30">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-coral text-white shadow-cozy-lg transition-transform duration-200 group-hover:scale-110 md:h-28 md:w-28">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {video.duration && (
              <span className="absolute bottom-4 right-4 rounded-full bg-ink/85 px-3 py-1.5 font-display text-sm font-semibold text-surface md:text-base">
                {video.duration}
              </span>
            )}
            {video.category && (
              <span className="absolute left-4 top-4 rounded-full bg-brand-primary/95 px-3 py-1.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-ink md:text-sm">
                {video.category.replace("-", " ")}
              </span>
            )}
          </div>
        </Link>

        {/* Copy + meta */}
        <div className="flex flex-col justify-center rounded-[2rem] border border-ink/10 bg-surface p-7 shadow-cozy-md md:p-10">
          <p className="font-display text-xs font-bold uppercase tracking-[0.3em] text-warm-muted md:text-sm">
            Featured Now
          </p>
          <h2 className="mt-3 line-clamp-3 font-display text-3xl font-bold leading-[1.05] text-ink md:text-4xl lg:text-5xl">
            {video.title}
          </h2>

          <dl className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3">
            {channel && (
              <div>
                <dt className="font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink/65 md:text-xs">
                  Channel
                </dt>
                <dd className="mt-0.5 font-display text-base font-bold text-ink md:text-lg">
                  {channel.name}
                </dd>
              </div>
            )}
            {typeof video.viewCount === "number" && (
              <div>
                <dt className="font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink/65 md:text-xs">
                  Views
                </dt>
                <dd className="mt-0.5 font-display text-base font-bold text-ink md:text-lg">
                  {formatViews(video.viewCount)}
                </dd>
              </div>
            )}
            {video.uploadDate && (
              <div>
                <dt className="font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink/65 md:text-xs">
                  Uploaded
                </dt>
                <dd className="mt-0.5 font-display text-base font-bold text-ink md:text-lg">
                  {formatDate(video.uploadDate)}
                </dd>
              </div>
            )}
          </dl>

          <div className="mt-7">
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="cta-shimmer inline-flex min-h-[48px] items-center justify-center gap-2 rounded-full bg-ink px-7 font-display text-base font-bold text-surface shadow-cozy-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-cozy-lg"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
              Watch on YouTube
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

function formatDate(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;
  return then.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
