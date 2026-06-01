import type { ContentSource } from "../adapter";

/**
 * Skeleton implementation. Future migration target.
 *
 * Swap path: implement each method to query Sanity GROQ, validate responses
 * against the same Zod schemas, return data. Components do NOT change.
 *
 * Phase 4 added the video-rich methods (`getFeaturedVideo`, `getLatestVideos`,
 * `getVideosByCategory`, `getVideosByPlaylist`, `getPlaylists`,
 * `getPlaylistById`). The same swap path applies: query Sanity, validate,
 * return.
 */
const notImplemented = (method: string): never => {
  throw new Error(
    `[content/sanity] ${method}() not implemented yet. Set CONTENT_SOURCE=json or implement.`,
  );
};

export const sanityContentSource: ContentSource = {
  async getSiteConfig() {
    return notImplemented("getSiteConfig");
  },
  async getCharacters() {
    return notImplemented("getCharacters");
  },
  async getCharacterBySlug() {
    return notImplemented("getCharacterBySlug");
  },
  async getVideos() {
    return notImplemented("getVideos");
  },
  async getFeaturedVideo() {
    return notImplemented("getFeaturedVideo");
  },
  async getLatestVideos() {
    return notImplemented("getLatestVideos");
  },
  async getVideosByCategory() {
    return notImplemented("getVideosByCategory");
  },
  async getVideosByPlaylist() {
    return notImplemented("getVideosByPlaylist");
  },
  async getChannels() {
    return notImplemented("getChannels");
  },
  async getPlaylists() {
    return notImplemented("getPlaylists");
  },
  async getPlaylistById() {
    return notImplemented("getPlaylistById");
  },
  async getComingSoonPages() {
    return notImplemented("getComingSoonPages");
  },
  async getComingSoonPageBySlug() {
    return notImplemented("getComingSoonPageBySlug");
  },
  async getTopPicks() {
    return notImplemented("getTopPicks");
  },
};
