import type { Channel } from "@/lib/content";

/** Inline YouTube glyph — the rounded play badge. */
function YouTubeGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
      <path
        fill="#FF0000"
        d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8Z"
      />
      <path fill="#fff" d="M9.6 15.6V8.4l6.2 3.6-6.2 3.6Z" />
    </svg>
  );
}

/**
 * Small integrated YouTube channel badge for a character detail page — an
 * emblem disc + a two-line label, themed by the page `decor` color so it reads
 * as part of the design rather than a bare link. External link, opens in a new
 * tab. Text stays `ink`/`warm-muted` on a light pill for WCAG AA contrast.
 */
export function CharacterChannelBadge({
  channel,
  decor,
}: {
  channel: Channel;
  decor: string;
}) {
  return (
    <a
      href={channel.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Watch ${channel.name} on YouTube (opens in a new tab)`}
      className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-ink/10 bg-surface/90 py-2 pl-2.5 pr-4 shadow-cozy transition-transform duration-300 ease-gentle hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2"
    >
      {/* Themed emblem disc — decor-tinted, holds the YouTube mark. */}
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: `${decor}26` }}
      >
        <YouTubeGlyph />
      </span>
      <span className="text-left">
        <span className="block font-display text-[0.65rem] font-bold uppercase tracking-[0.18em] text-ink-blue/70">
          YouTube Channel
        </span>
        <span className="block font-display text-sm font-bold leading-tight text-ink-blue">
          {channel.name}
        </span>
      </span>
    </a>
  );
}
