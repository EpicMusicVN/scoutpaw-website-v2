import { z } from "zod";

export const HexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "must be 6-digit hex like #FFB627");

export const CharacterSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  breed: z.string().min(1),
  tagline: z.string(),
  bio: z.string(),
  funFacts: z.array(z.string()).default([]),
  image: z.string().min(1),
  accentColor: HexColorSchema,
  order: z.number().int().nonnegative(),
});
export type Character = z.infer<typeof CharacterSchema>;

// Mood axis — used by playlists (e.g. "calm-sounds for naps"). Kept as the
// renamed export of the original VideoCategorySchema for clarity now that
// videos use a separate content axis below.
export const PLAYLIST_CATEGORIES = [
  "calm-sounds",
  "naps",
  "adventures",
  "ambient",
  "stories",
  "shorts",
] as const;
export const PlaylistCategorySchema = z.enum(PLAYLIST_CATEGORIES);
export type PlaylistCategory = z.infer<typeof PlaylistCategorySchema>;

// Content axis — used by videos for ExploreVideos filter chips on /watch.
// Orthogonal to PLAYLIST_CATEGORIES: a video tagged "dogs" can sit in a
// "calm-sounds" playlist without conflict.
export const VIDEO_CONTENTS = [
  "dogs",
  "cats",
  "shorts",
  "funny",
  "product-reviews",
  "community",
] as const;
export const VideoContentSchema = z.enum(VIDEO_CONTENTS);
export type VideoContent = z.infer<typeof VideoContentSchema>;

// Friendly display labels for VideoContent values. Shared by the WatchHero
// badge + ExploreVideos filter chips so the two surfaces never drift.
export const VIDEO_CONTENT_LABELS: Record<VideoContent, string> = {
  dogs: "Dogs",
  cats: "Cats",
  shorts: "Shorts",
  funny: "Funny",
  "product-reviews": "Product Reviews",
  community: "Community",
};

export const VideoSchema = z.object({
  // `id` is the stable internal key (used for FK references). Defaults to
  // `youtubeId` when omitted so older mock entries don't need migration.
  id: z.string().min(1).optional(),
  youtubeId: z.string().min(1),
  title: z.string(),
  characterSlugs: z.array(z.string()).default([]),
  viewCount: z.number().int().nonnegative().optional(),
  duration: z.string().optional(),

  // Phase 4 extensions — all optional so existing entries remain valid.
  thumbnail: z.string().optional(),
  // FK → Channel.slug (the existing channel identifier). Named `channelSlug`
  // rather than `channelId` so the relationship is obvious at the call site.
  channelSlug: z.string().optional(),
  uploadDate: z.string().optional(), // ISO date "YYYY-MM-DD"
  category: VideoContentSchema.optional(),
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  playlistId: z.string().optional(),
  // Optional local video asset. When present, hero/playback surfaces render
  // an inline <video> instead of the YouTube thumbnail. Store as a bare key
  // (e.g. "watch/intro.mp4"); UI resolves via lib/utils/asset-url.
  videoSrc: z.string().optional(),
  videoPoster: z.string().optional(),
});
export type Video = z.infer<typeof VideoSchema>;

export const ChannelSchema = z.object({
  slug: z.string().min(1),
  name: z.string(),
  tagline: z.string(),
  subscriberCount: z.number().int().nonnegative(),
  videoCount: z.number().int().nonnegative(),
  url: z.string().min(1),
  bannerColor: HexColorSchema.optional(),
  characterSlug: z.string().min(1),
  avatarColor: HexColorSchema.optional(),
  // Phase 4 — FK to Video.id of the most recent upload (optional for back-compat).
  latestVideoId: z.string().optional(),
  // Cycle 5 (YouTube API) — when present, enrichChannels() overlays live
  // metadata onto the JSON fallback (name, avatar, subscriber count).
  youtubeChannelId: z.string().optional(),
  avatarUrl: z.string().optional(),
});
export type Channel = z.infer<typeof ChannelSchema>;

export const PlaylistSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  coverImage: z.string().min(1),
  videoIds: z.array(z.string()).default([]),
  category: PlaylistCategorySchema,
  accentColor: HexColorSchema.default("#e8b547"),
  // Optional external YouTube playlist URL. When present, PlaylistGrid cards
  // navigate to YouTube; when absent, cards render disabled with a "Coming
  // Soon" badge so the in-app flat library is no longer required.
  youtubeUrl: z.string().url().optional(),
});
export type Playlist = z.infer<typeof PlaylistSchema>;

export const ComingSoonPageSchema = z.object({
  slug: z.string().min(1),
  navLabel: z.string().min(1),
  title: z.string(),
  tagline: z.string(),
  characterSlug: z.string().min(1),
  newsletterTag: z.string().min(1),
});
export type ComingSoonPage = z.infer<typeof ComingSoonPageSchema>;

export const NavItemSchema = z.object({
  label: z.string(),
  href: z.string(),
  enabled: z.boolean(),
});
export type NavItem = z.infer<typeof NavItemSchema>;

export const SiteConfigSchema = z.object({
  brand: z.object({
    name: z.string(),
    fullName: z.string(),
    tagline: z.string(),
    description: z.string(),
    logo: z.string(),
    logoText: z.string(),
  }),
  audience: z.object({
    primary: z.string(),
    secondary: z.string(),
    designNotes: z.string(),
  }),
  palette: z.object({
    brandPrimary: HexColorSchema,
    brandSecondary: HexColorSchema,
    accentWarm: HexColorSchema,
    accentCool: HexColorSchema,
    textDark: HexColorSchema,
    backgroundCream: HexColorSchema,
    surface: HexColorSchema,
  }),
  navItems: z.array(NavItemSchema),
  footerExplore: z
    .array(z.object({ label: z.string(), href: z.string() }))
    .optional(),
  social: z.array(
    z.object({
      platform: z.string(),
      url: z.string(),
      label: z.string(),
    }),
  ),
  legal: z.object({
    privacyUrl: z.string().nullable(),
    termsUrl: z.string().nullable(),
  }).passthrough(),
});
export type SiteConfig = z.infer<typeof SiteConfigSchema>;

export const CharactersFileSchema = z.object({
  characters: z.array(CharacterSchema),
});
export const VideosFileSchema = z.object({
  videos: z.array(VideoSchema),
}).passthrough();
export const ChannelsFileSchema = z.object({
  channels: z.array(ChannelSchema),
});
export const PlaylistsFileSchema = z.object({
  playlists: z.array(PlaylistSchema),
});
export const ComingSoonFileSchema = z.object({
  pages: z.array(ComingSoonPageSchema),
});
