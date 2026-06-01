import channelsJson from "@/content/channels.json";
import charactersJson from "@/content/characters.json";
import comingSoonJson from "@/content/coming-soon.json";
import playlistsJson from "@/content/playlists.json";
import siteConfigJson from "@/content/site-config.json";
import topPicksJson from "@/content/top-picks.json";
import videosJson from "@/content/videos.json";
import type { ContentSource } from "../adapter";
import {
  ChannelsFileSchema,
  CharactersFileSchema,
  ComingSoonFileSchema,
  PlaylistsFileSchema,
  SiteConfigSchema,
  TopPicksContentSchema,
  VideosFileSchema,
  type Channel,
  type Character,
  type ComingSoonPage,
  type Playlist,
  type SiteConfig,
  type TopPicksContent,
  type Video,
  type VideoContent,
} from "../schemas";

/**
 * Validates each JSON file once at module load. Throws clear Zod errors
 * with field paths if any content is malformed — fail-fast at build time
 * is better than runtime surprises.
 */
const characters: Character[] = CharactersFileSchema.parse(charactersJson).characters;
const videos: Video[] = VideosFileSchema.parse(videosJson).videos;
const comingSoonPages: ComingSoonPage[] =
  ComingSoonFileSchema.parse(comingSoonJson).pages;
const channels: Channel[] = ChannelsFileSchema.parse(channelsJson).channels;
const playlists: Playlist[] = PlaylistsFileSchema.parse(playlistsJson).playlists;
const siteConfig: SiteConfig = SiteConfigSchema.parse(siteConfigJson);

// Top Picks — validate once, then keep picks sorted by `order` so the UI never
// has to re-sort. The deal block passes through untouched.
const topPicksParsed: TopPicksContent = TopPicksContentSchema.parse(topPicksJson);
const topPicks: TopPicksContent = {
  deal: topPicksParsed.deal,
  picks: [...topPicksParsed.picks].sort((a, b) => a.order - b.order),
};

const sortedCharacters = [...characters].sort((a, b) => a.order - b.order);

/** Resolve a video's stable id, falling back to youtubeId for legacy entries. */
const videoId = (v: Video): string => v.id ?? v.youtubeId;

/** Latest first — videos with `uploadDate` win, others fall back to file order. */
const sortedByDateDesc = [...videos].sort((a, b) => {
  if (a.uploadDate && b.uploadDate) {
    return b.uploadDate.localeCompare(a.uploadDate);
  }
  if (a.uploadDate) return -1;
  if (b.uploadDate) return 1;
  return 0;
});

export const jsonContentSource: ContentSource = {
  async getSiteConfig() {
    return siteConfig;
  },
  async getCharacters() {
    return sortedCharacters;
  },
  async getCharacterBySlug(slug) {
    return sortedCharacters.find((c) => c.slug === slug) ?? null;
  },
  async getVideos() {
    return videos;
  },
  async getFeaturedVideo() {
    return sortedByDateDesc.find((v) => v.featured) ?? sortedByDateDesc[0] ?? null;
  },
  async getLatestVideos(limit = 8) {
    return sortedByDateDesc.slice(0, limit);
  },
  async getVideosByCategory(category: VideoContent) {
    return sortedByDateDesc.filter((v) => v.category === category);
  },
  async getVideosByPlaylist(playlistId: string) {
    const playlist = playlists.find((p) => p.id === playlistId);
    if (!playlist) return [];
    // Preserve the playlist's curated order, not date order.
    return playlist.videoIds
      .map((id) => videos.find((v) => videoId(v) === id))
      .filter((v): v is Video => Boolean(v));
  },
  async getChannels() {
    return channels;
  },
  async getPlaylists() {
    return playlists;
  },
  async getPlaylistById(id) {
    return playlists.find((p) => p.id === id) ?? null;
  },
  async getComingSoonPages() {
    return comingSoonPages;
  },
  async getComingSoonPageBySlug(slug) {
    return comingSoonPages.find((p) => p.slug === slug) ?? null;
  },
  async getTopPicks() {
    return topPicks;
  },
};
