import type { ContentSource } from "./adapter";
import { jsonContentSource } from "./sources/json-source";
import { payloadContentSource } from "./sources/payload-source";

const mode = process.env.CONTENT_SOURCE ?? "json";

const sources: Record<string, ContentSource> = {
  json: jsonContentSource,
  payload: payloadContentSource,
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
  FaqItem,
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
