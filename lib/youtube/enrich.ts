import type { Channel, Video } from "@/lib/content";
import { fetchChannels, fetchVideos } from "./client";

/**
 * Overlay live YouTube data onto each JSON channel by `youtubeChannelId`.
 * Falls back to original JSON values for any entry without a YouTube ID or
 * with no matching API response (graceful degradation when key/network fails).
 */
export async function enrichChannels(channels: Channel[]): Promise<Channel[]> {
  const ids = channels
    .map((c) => c.youtubeChannelId)
    .filter((x): x is string => Boolean(x));
  if (ids.length === 0) return channels;
  const apiChannels = await fetchChannels(ids);
  const byId = new Map(apiChannels.map((c) => [c.id, c]));
  return channels.map((c) => {
    if (!c.youtubeChannelId) return c;
    const live = byId.get(c.youtubeChannelId);
    if (!live) return c;
    return {
      ...c,
      name: live.title || c.name,
      avatarUrl: live.thumbnailUrl || c.avatarUrl,
      subscriberCount: live.subscriberCount ?? c.subscriberCount,
      videoCount: live.videoCount ?? c.videoCount,
    };
  });
}

/**
 * Overlay live YouTube data onto each JSON video by `youtubeId`. Skips
 * placeholder IDs (TODO_*). Falls back to JSON when API returns nothing.
 */
export async function enrichVideos(videos: Video[]): Promise<Video[]> {
  const ids = videos
    .map((v) => v.youtubeId)
    .filter((id) => id && !id.startsWith("TODO_"));
  if (ids.length === 0) return videos;
  const apiVideos = await fetchVideos(ids);
  const byId = new Map(apiVideos.map((v) => [v.id, v]));
  return videos.map((v) => {
    const live = byId.get(v.youtubeId);
    if (!live) return v;
    return {
      ...v,
      title: live.title || v.title,
      thumbnail: live.thumbnailUrl || v.thumbnail,
      duration: live.duration || v.duration,
      uploadDate: live.publishedAt
        ? live.publishedAt.slice(0, 10)
        : v.uploadDate,
      viewCount: live.viewCount ?? v.viewCount,
    };
  });
}
