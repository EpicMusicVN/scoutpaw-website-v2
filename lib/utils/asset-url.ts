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

/**
 * Key prefixes always served from the deployment's own `public/assets/`, even
 * when the R2 CDN is configured. The 2D brand art (`public/assets/brand/`) ships
 * with the repo and is not mirrored to the bucket; once it is uploaded there,
 * remove its prefix here to move it back onto the CDN.
 */
const LOCAL_ONLY_PREFIXES = ["brand/"];

export function assetUrl(key: string): string {
  // Pass through absolute URLs so API-fetched values (e.g. i.ytimg.com
  // thumbnails, yt3.googleusercontent.com avatars) don't get corrupted by
  // the R2 prefix when callers naively wrap every image src.
  if (/^https?:\/\//i.test(key)) return key;
  const k = key.replace(/^\/+/, "").replace(/^assets\//, "");
  const local = !BASE_URL || LOCAL_ONLY_PREFIXES.some((prefix) => k.startsWith(prefix));
  return local ? `/assets/${k}` : `${BASE_URL}/assets/${k}`;
}
