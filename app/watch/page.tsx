import type { Metadata } from "next";
import { ScrollReveal } from "@/components/motion/scroll-reveal";
import { CloudDivider } from "@/components/ui/cloud-divider";
import { ExploreVideos } from "@/components/watch/explore-videos";
import { OurChannels } from "@/components/watch/our-channels";
import { SubscribeCard } from "@/components/watch/subscribe-card";
import { VideoRail } from "@/components/watch/video-rail";
import { WatchHero } from "@/components/watch/watch-hero";
import { content } from "@/lib/content";
import { enrichChannels, enrichVideos } from "@/lib/youtube/enrich";

export const metadata: Metadata = {
  title: "Watch",
  description:
    "Calm sounds and gentle stories for your pup's day. Browse the full ScoutPaw video library.",
};

export default async function WatchPage() {
  const [rawVideos, rawChannels, characters, config, rawFeatured] = await Promise.all([
    content.getVideos(),
    content.getChannels(),
    content.getCharacters(),
    content.getSiteConfig(),
    content.getFeaturedVideo(),
  ]);

  // Overlay live YouTube metadata (titles, thumbnails, durations, channel
  // avatars + sub counts) onto the JSON fallback. Server-side, 1hr cache.
  const [videos, channels, featured] = await Promise.all([
    enrichVideos(rawVideos),
    enrichChannels(rawChannels),
    rawFeatured ? enrichVideos([rawFeatured]).then((arr) => arr[0] ?? null) : Promise.resolve(null),
  ]);

  const youtube = config.social.find((s) => s.platform === "youtube");
  const youtubeUrl =
    youtube && !youtube.url.startsWith("TODO") ? youtube.url : "https://www.youtube.com";

  const featuredChannel = featured?.channelSlug
    ? channels.find((c) => c.slug === featured.channelSlug) ?? null
    : null;

  // Community Choice — top viewed videos. Sort in place (over a copy) so the
  // mock data's chronological default order isn't mutated for other consumers.
  const communityChoice = [...videos]
    .sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
    .slice(0, 8);

  return (
    <>
      {/* Hero: centered featured video + stacked title/description/CTAs */}
      {featured && (
        <WatchHero
          featured={featured}
          channel={featuredChannel}
          youtubeChannelUrl={youtubeUrl}
        />
      )}

      <CloudDivider />

      {/* The Network — compact horizontal rail */}
      <ScrollReveal>
        <OurChannels channels={channels} characters={characters} videos={videos} />
      </ScrollReveal>

      <CloudDivider />

      {/* Community Choice — top viewed rail */}
      <ScrollReveal>
        <VideoRail
          kicker="Community Choice"
          title="Community Choice to Watch."
          videos={communityChoice}
          seeAllHref="#explore"
          seeAllLabel="Explore all"
          channelLabel="@ScoutPawTV"
        />
      </ScrollReveal>

      <CloudDivider />

      {/* Explore Videos — filter chips + mixed grid */}
      <ScrollReveal>
        <ExploreVideos videos={videos} youtubeChannelUrl={youtubeUrl} />
      </ScrollReveal>

      <CloudDivider />

      {/* Subscribe CTA */}
      <ScrollReveal>
        <SubscribeCard youtubeUrl={youtubeUrl} />
      </ScrollReveal>
    </>
  );
}
