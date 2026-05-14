/**
 * Single source of truth for asset URL resolution. All component/JSON asset
 * references go through this helper. When `NEXT_PUBLIC_R2_BASE_URL` is set,
 * resolves to the Cloudflare R2 CDN (under the `assets/` prefix that mirrors
 * the local `public/assets/` layout). Otherwise falls back to local
 * `/public/assets/` so developers without R2 env access can still run the site.
 *
 * Tolerant of accidental leading "/" or "assets/" prefix in callers/data so
 * partially-migrated content doesn't render broken URLs.
 */
const BASE_URL = process.env.NEXT_PUBLIC_R2_BASE_URL?.replace(/\/+$/, "") ?? "";

export function assetUrl(key: string): string {
  // Pass through absolute URLs so API-fetched values (e.g. i.ytimg.com
  // thumbnails, yt3.googleusercontent.com avatars) don't get corrupted by
  // the R2 prefix when callers naively wrap every image src.
  if (/^https?:\/\//i.test(key)) return key;
  const k = key.replace(/^\/+/, "").replace(/^assets\//, "");
  return BASE_URL ? `${BASE_URL}/assets/${k}` : `/assets/${k}`;
}
