import type {
  Channel,
  Character,
  ComingSoonPage,
  Playlist,
  SiteConfig,
  Video,
  VideoContent,
} from "./schemas";

/**
 * Content source contract.
 *
 * Implementations (json now, sanity later, youtube-api eventually) MUST
 * satisfy this interface. Components import from `@/lib/content` only —
 * never from sources directly. Swap is a one-line env flag flip in `index.ts`.
 *
 * Phase 4 added the `getFeatured*`, `getVideosBy*`, `getLatestVideos`, and
 * `getPlaylists*` methods. They keep the JSON adapter cheap (in-memory filter)
 * and let a future YouTube Data API adapter return the same shape with no UI
 * changes.
 */
export interface ContentSource {
  getSiteConfig(): Promise<SiteConfig>;
  getCharacters(): Promise<Character[]>;
  getCharacterBySlug(slug: string): Promise<Character | null>;
  getVideos(): Promise<Video[]>;
  getFeaturedVideo(): Promise<Video | null>;
  getLatestVideos(limit?: number): Promise<Video[]>;
  getVideosByCategory(category: VideoContent): Promise<Video[]>;
  getVideosByPlaylist(playlistId: string): Promise<Video[]>;
  getChannels(): Promise<Channel[]>;
  getPlaylists(): Promise<Playlist[]>;
  getPlaylistById(id: string): Promise<Playlist | null>;
  getComingSoonPages(): Promise<ComingSoonPage[]>;
  getComingSoonPageBySlug(slug: string): Promise<ComingSoonPage | null>;
}
