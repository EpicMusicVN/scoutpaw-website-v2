/**
 * Strongly-typed views of the YouTube Data API v3 responses we use. Only the
 * fields our UI consumes are exposed; raw API shapes stay inside the client.
 */
export interface YouTubeChannel {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  subscriberCount?: number;
  videoCount?: number;
  customUrl?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  publishedAt: string;
  channelId: string;
  channelTitle: string;
  viewCount?: number;
}
