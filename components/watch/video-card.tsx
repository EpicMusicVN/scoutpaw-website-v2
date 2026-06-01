import Image from "next/image";
import Link from "next/link";
import type { Video } from "@/lib/content";
import { assetUrl } from "@/lib/utils/asset-url";

type Variant = "compact" | "default" | "featured";

/**
 * Canonical video card. Same component used by Home WatchTogether, the Watch
 * page rails + library, and the featured hero. Variants control density only
 * — the data shape stays consistent.
 *
 * Renders the richer Phase 4 fields (`thumbnail`, `uploadDate`, `category`)
 * when present. Falls back to YouTube auto-thumbnail + existing fields for
 * legacy entries so the swap to a YouTube Data API source is content-only.
 */
export function VideoCard({
  video,
  variant = "default",
  channelLabel,
}: {
  video: Video;
  variant?: Variant;
  channelLabel?: string;
}) {
  const isPlaceholder = video.youtubeId.startsWith("TODO");
  const thumbnail = video.thumbnail
    ? assetUrl(video.thumbnail)
    : isPlaceholder
      ? assetUrl("banner/banner.png")
      : `https://i.ytimg.com/vi/${video.youtubeId}/hqdefault.jpg`;
  const href = isPlaceholder
    ? "https://www.youtube.com"
    : `https://www.youtube.com/watch?v=${video.youtubeId}`;

  const titleSize =
    variant === "featured"
      ? "text-2xl md:text-3xl lg:text-4xl"
      : variant === "compact"
        ? "text-base md:text-lg"
        : "text-lg md:text-xl";

  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group block focus-visible:outline-none"
      aria-label={`Watch ${video.title} on YouTube`}
    >
      <div className="relative aspect-video overflow-hidden rounded-[1.5rem] border border-ink/10 bg-ink/5 shadow-cozy transition-all duration-300 ease-gentle group-hover:-translate-y-1 group-hover:shadow-cozy-lg">
        <Image
          src={thumbnail}
          alt=""
          fill
          sizes={variant === "featured" ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors duration-200 group-hover:bg-ink/30">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-coral text-white shadow-cozy-md transition-transform duration-200 group-hover:scale-110 md:h-20 md:w-20">
            <PlayIcon />
          </div>
        </div>
        {video.duration && (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink/80 px-2.5 py-1 font-display text-xs font-semibold text-surface md:text-sm">
            {video.duration}
          </span>
        )}
        {video.category && variant !== "compact" && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-primary/95 px-2.5 py-1 font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink-blue md:text-xs">
            {video.category.replace("-", " ")}
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className={`line-clamp-2 font-display font-bold leading-tight text-ink-blue ${titleSize}`}>
          {video.title}
        </h3>
        <MetaLine video={video} channelLabel={channelLabel} />
      </div>
    </Link>
  );
}

function MetaLine({ video, channelLabel }: { video: Video; channelLabel?: string }) {
  const parts: React.ReactNode[] = [];
  if (channelLabel) {
    parts.push(
      <span key="ch" className="font-display font-semibold">
        {channelLabel}
      </span>,
    );
  }
  if (typeof video.viewCount === "number") {
    parts.push(<span key="vc">{formatViews(video.viewCount)} views</span>);
  }
  if (video.uploadDate) {
    parts.push(<span key="ud">{formatDate(video.uploadDate)}</span>);
  }

  if (parts.length === 0) return null;

  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-ink-blue/70">
      {parts.map((part, i) => (
        <span key={i} className="inline-flex items-center gap-2.5">
          {i > 0 && <span aria-hidden="true">•</span>}
          {part}
        </span>
      ))}
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function formatViews(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return String(n);
}

/**
 * Absolute upload date. Avoids `Date.now()` so SSR markup matches client
 * hydration and the rendered text doesn't drift staler the longer the deploy
 * lives. Format mirrors the FeaturedVideo card.
 */
function formatDate(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return iso;
  return then.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}
