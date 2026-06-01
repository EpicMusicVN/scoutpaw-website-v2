import { z } from "zod";

export const HexColorSchema = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "must be 6-digit hex like #FFB627");

// Related merchandise for a character — surfaced on the /characters page (v8).
export const CharacterProductSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  image: z.string().min(1), // bare asset key, resolved via lib/utils/asset-url
  badge: z.string().optional(), // optional highlight, e.g. "Bestseller"
  ctaHref: z.string().min(1), // external storefront URL
});
export type CharacterProduct = z.infer<typeof CharacterProductSchema>;

export const CharacterSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  breed: z.string().min(1),
  tagline: z.string(),
  bio: z.string(),
  quote: z.string().min(1),
  image: z.string().min(1),
  // Full-body standing pose cutouts. At least one; the Characters scene + the
  // detail-page hero render `poses[0]`. Extra entries are alternate poses kept
  // for data flexibility (e.g. swapping which pose leads).
  poses: z.array(z.string()).min(1),
  // Related merchandise + storefront CTA for the per-character section (v8).
  // Additive + defaulted so older character data stays valid.
  products: z.array(CharacterProductSchema).default([]),
  merchCtaHref: z.string().optional(),
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

// Top Picks — curated favourites surface on /top-picks. Standalone taxonomy:
// pet-product categories, intentionally separate from the /shop SHOP_CATEGORIES.
export const TOP_PICK_CATEGORIES = [
  "apparel",
  "pet-supplies",
  "pet-toys",
  "home-living",
  "others",
] as const;
export const TopPickCategorySchema = z.enum(TOP_PICK_CATEGORIES);
export type TopPickCategory = z.infer<typeof TopPickCategorySchema>;

// Friendly display labels — shared by the Top Picks filter chips so the
// category slug (routing/data) and the visible label never drift.
export const TOP_PICK_CATEGORY_LABELS: Record<TopPickCategory, string> = {
  apparel: "Apparel",
  "pet-supplies": "Pet Supplies",
  "pet-toys": "Pet Toys",
  "home-living": "Home Living",
  others: "Others",
};

export const TopPickSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  category: TopPickCategorySchema,
  // Bare asset key (e.g. "shop/1.jpg"); UI resolves via lib/utils/asset-url.
  image: z.string().min(1),
  // 1-2 sentence short description shown below the title. Optional so older
  // picks without copy still render. Amazon Associates ToS forbids displaying
  // live prices without PA-API; price field intentionally absent.
  description: z.string().optional(),
  badge: z.string().optional(), // discount/highlight, e.g. "30% OFF"
  rating: z.number().min(0).max(5).optional(),
  popularity: z.string().optional(), // e.g. "Bestseller", "1.2k loved"
  ctaLabel: z.string().default("Shop Now"),
  ctaHref: z.string().min(1), // external storefront URL
  order: z.number().int().nonnegative(),
});
export type TopPick = z.infer<typeof TopPickSchema>;

export const DealBlockSchema = z.object({
  badge: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  image: z.string().min(1),
});
export type DealBlock = z.infer<typeof DealBlockSchema>;

// `top-picks.json` is itself shaped `{ deal, picks }`, so this content schema
// doubles as the file schema — no separate wrapper needed.
export const TopPicksContentSchema = z.object({
  deal: DealBlockSchema,
  picks: z.array(TopPickSchema),
});
export type TopPicksContent = z.infer<typeof TopPicksContentSchema>;

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
