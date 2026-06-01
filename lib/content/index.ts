import type { ContentSource } from "./adapter";
import { jsonContentSource } from "./sources/json-source";
import { sanityContentSource } from "./sources/sanity-source";

const mode = process.env.CONTENT_SOURCE ?? "json";

const sources: Record<string, ContentSource> = {
  json: jsonContentSource,
  sanity: sanityContentSource,
};

const selected = sources[mode];
if (!selected) {
  throw new Error(
    `[content] Unknown CONTENT_SOURCE="${mode}". Expected: ${Object.keys(sources).join(", ")}`,
  );
}

export const content: ContentSource = selected;

export type {
  Channel,
  Character,
  CharacterProduct,
  ComingSoonPage,
  DealBlock,
  NavItem,
  Playlist,
  PlaylistCategory,
  SiteConfig,
  TopPick,
  TopPickCategory,
  TopPicksContent,
  Video,
  VideoContent,
} from "./schemas";
