import type { ContentSource } from "../adapter";

/**
 * Payload CMS content source — STUB (Phase 1).
 *
 * Phase 1 wires Payload (auth + admin + R2 media) but migrates NO content.
 * Phases 2–7 implement each method by querying the Payload Local API
 * (`getPayloadClient()` from `@/lib/payload/client`), validating the result
 * against the same Zod schemas in `lib/content/schemas.ts`, and returning the
 * adapter shape. Components never change. Until a method is implemented, keep
 * `CONTENT_SOURCE=json`.
 */
const notImplemented = (method: string): never => {
  throw new Error(
    `[content/payload] ${method}() not implemented yet. Set CONTENT_SOURCE=json or implement.`,
  );
};

export const payloadContentSource: ContentSource = {
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
  async getFaq() {
    return notImplemented("getFaq");
  },
};
