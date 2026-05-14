import { parseISODuration } from "./duration";
import type { YouTubeChannel, YouTubeVideo } from "./types";

const API_BASE = "https://www.googleapis.com/youtube/v3";
const API_KEY = process.env.YOUTUBE_API_KEY ?? "";

/** YouTube allows up to 50 IDs per channels.list or videos.list request. */
const MAX_IDS_PER_CALL = 50;

/**
 * When the Google Cloud API key is restricted by HTTP referrer, server-side
 * fetches must spoof a Referer header that matches the allowlist. Derived from
 * `NEXT_PUBLIC_SITE_URL` so dev (`http://localhost:3000`) and prod
 * (`https://your-domain.com`) each send the matching value. Falls back to a
 * dev-safe default if the env var is empty.
 */
const REFERER = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/+$/, "") + "/";

/** Shared fetch options for both endpoints — Referer header + 1hr revalidate. */
const FETCH_OPTS = {
  headers: { Referer: REFERER },
  next: { revalidate: 3600 },
} as const;

interface ThumbnailDict {
  default?: { url: string };
  medium?: { url: string };
  high?: { url: string };
  standard?: { url: string };
  maxres?: { url: string };
}

function pickThumb(thumbs: ThumbnailDict | undefined): string {
  return (
    thumbs?.maxres?.url ??
    thumbs?.high?.url ??
    thumbs?.medium?.url ??
    thumbs?.default?.url ??
    ""
  );
}

/**
 * Fetch live channel metadata (snippet + statistics) for up to 50 channel IDs.
 * Returns `[]` on missing API key, empty input, network failure, or non-OK
 * response so callers can fall back to JSON data without try/catch.
 */
export async function fetchChannels(ids: string[]): Promise<YouTubeChannel[]> {
  // [DIAG] Remove these console.* lines once API integration is verified.
  console.log(`[yt:fetchChannels] keyLen=${API_KEY.length} ids=${ids.length}`);
  if (!API_KEY || ids.length === 0) {
    console.log(`[yt:fetchChannels] early-return (no key or no ids)`);
    return [];
  }
  const idParam = ids.slice(0, MAX_IDS_PER_CALL).join(",");
  const url = `${API_BASE}/channels?part=snippet,statistics&id=${idParam}&key=${API_KEY}`;
  try {
    const res = await fetch(url, FETCH_OPTS);
    console.log(`[yt:fetchChannels] status=${res.status} ok=${res.ok}`);
    if (!res.ok) {
      const errBody = await res.text().catch(() => "<no body>");
      console.log(`[yt:fetchChannels] error body: ${errBody.slice(0, 400)}`);
      return [];
    }
    const data = (await res.json()) as {
      items?: Array<{
        id: string;
        snippet?: {
          title?: string;
          description?: string;
          customUrl?: string;
          thumbnails?: ThumbnailDict;
        };
        statistics?: { subscriberCount?: string; videoCount?: string };
      }>;
    };
    const items = data.items ?? [];
    console.log(`[yt:fetchChannels] returned ${items.length} item(s)`);
    return items.map((item) => ({
      id: item.id,
      title: item.snippet?.title ?? "",
      description: item.snippet?.description ?? "",
      thumbnailUrl: pickThumb(item.snippet?.thumbnails),
      subscriberCount: item.statistics?.subscriberCount
        ? Number(item.statistics.subscriberCount)
        : undefined,
      videoCount: item.statistics?.videoCount
        ? Number(item.statistics.videoCount)
        : undefined,
      customUrl: item.snippet?.customUrl,
    }));
  } catch (err) {
    console.log(`[yt:fetchChannels] threw: ${(err as Error)?.message}`);
    return [];
  }
}

/**
 * Fetch live video metadata for up to 50 video IDs. Same failure-mode contract
 * as fetchChannels — returns `[]` instead of throwing.
 */
export async function fetchVideos(ids: string[]): Promise<YouTubeVideo[]> {
  // [DIAG] Remove these console.* lines once API integration is verified.
  console.log(`[yt:fetchVideos] keyLen=${API_KEY.length} ids=${ids.length}`);
  if (!API_KEY || ids.length === 0) {
    console.log(`[yt:fetchVideos] early-return (no key or no ids)`);
    return [];
  }
  const idParam = ids.slice(0, MAX_IDS_PER_CALL).join(",");
  const url = `${API_BASE}/videos?part=snippet,contentDetails,statistics&id=${idParam}&key=${API_KEY}`;
  try {
    const res = await fetch(url, FETCH_OPTS);
    console.log(`[yt:fetchVideos] status=${res.status} ok=${res.ok}`);
    if (!res.ok) {
      const errBody = await res.text().catch(() => "<no body>");
      console.log(`[yt:fetchVideos] error body: ${errBody.slice(0, 400)}`);
      return [];
    }
    const data = (await res.json()) as {
      items?: Array<{
        id: string;
        snippet?: {
          title?: string;
          description?: string;
          channelId?: string;
          channelTitle?: string;
          publishedAt?: string;
          thumbnails?: ThumbnailDict;
        };
        contentDetails?: { duration?: string };
        statistics?: { viewCount?: string };
      }>;
    };
    const items = data.items ?? [];
    console.log(`[yt:fetchVideos] returned ${items.length} item(s)`);
    return items.map((item) => ({
      id: item.id,
      title: item.snippet?.title ?? "",
      description: item.snippet?.description ?? "",
      thumbnailUrl: pickThumb(item.snippet?.thumbnails),
      duration: parseISODuration(item.contentDetails?.duration ?? ""),
      publishedAt: item.snippet?.publishedAt ?? "",
      channelId: item.snippet?.channelId ?? "",
      channelTitle: item.snippet?.channelTitle ?? "",
      viewCount: item.statistics?.viewCount
        ? Number(item.statistics.viewCount)
        : undefined,
    }));
  } catch (err) {
    console.log(`[yt:fetchVideos] threw: ${(err as Error)?.message}`);
    return [];
  }
}
