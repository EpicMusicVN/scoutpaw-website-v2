"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

type AudioState = "sound-on" | "muted";

type Props = {
  src: string;
  poster?: string;
  title: string;
  className?: string;
};

/**
 * HeroVideo — autoplays the /watch hero video with optimistic sound.
 *
 * Browser autoplay policies block audio without a user gesture (Chrome 2018,
 * Safari 2017, Firefox 2019, iOS Safari strict). We attempt unmuted play() on
 * mount; on rejection we fall back to muted autoplay and surface a "Tap for
 * sound" pill so the user can opt in with a single click. The pill also acts
 * as a mute toggle (WCAG 1.4.2 — user must be able to stop auto-playing
 * audio).
 *
 * No `muted`/`defaultMuted` attribute in JSX — controlled entirely through the
 * ref to avoid React fighting our imperative play attempts.
 */
export function HeroVideo({ src, poster, title, className }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Initial render matches SSR: visually treated as muted so the pill renders
  // immediately. Effect upgrades to 'sound-on' if the unmuted play succeeds.
  const [audioState, setAudioState] = useState<AudioState>("muted");

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = false;
    v.play()
      .then(() => setAudioState("sound-on"))
      .catch(() => {
        // Autoplay policy blocked sound. Fall back to muted autoplay so the
        // video at least starts; the pill click below can later upgrade to
        // sound under the satisfying user gesture.
        v.muted = true;
        v.play().catch(() => {});
      });
  }, []);

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent the wrapping <Link> in WatchHero from navigating to YouTube.
    e.preventDefault();
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    if (audioState === "muted") {
      v.muted = false;
      v.play()
        .then(() => setAudioState("sound-on"))
        .catch(() => {
          // Extremely rare — gesture should satisfy policy. Leave muted.
          v.muted = true;
        });
    } else {
      v.muted = true;
      setAudioState("muted");
    }
  };

  const isMuted = audioState === "muted";

  return (
    <>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        loop
        playsInline
        preload="metadata"
        aria-label={`Watch ${title} on YouTube`}
        className={className}
      />
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isMuted ? "Unmute video" : "Mute video"}
        aria-pressed={!isMuted}
        className={cn(
          "absolute bottom-4 right-4 z-10 inline-flex items-center justify-center rounded-full transition-transform duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          isMuted
            ? "gap-1.5 bg-brand-coral px-3.5 py-2 font-display text-xs font-bold uppercase tracking-[0.15em] text-white shadow-cozy-md hover:scale-105 focus-visible:ring-white motion-safe:animate-pulse md:text-sm"
            : "h-10 w-10 bg-white/70 text-ink-blue shadow-sm backdrop-blur-sm hover:scale-110 focus-visible:ring-brand-primary",
        )}
      >
        {isMuted ? (
          <>
            <SpeakerIcon />
            <span>Tap for sound</span>
          </>
        ) : (
          <MuteIcon />
        )}
      </button>
    </>
  );
}

function SpeakerIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M3 10v4a1 1 0 0 0 1 1h3l4 4V5L7 9H4a1 1 0 0 0-1 1zm13.5 2a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
    </svg>
  );
}

function MuteIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16.5 12a4.5 4.5 0 0 0-2.5-4.03v2.21l2.45 2.45A4.5 4.5 0 0 0 16.5 12zM19 12c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.96 8.96 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06A7 7 0 0 1 19 12zM4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25a7.04 7.04 0 0 1-2.25 1.21v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4 9.91 6.09 12 8.18V4z" />
    </svg>
  );
}
