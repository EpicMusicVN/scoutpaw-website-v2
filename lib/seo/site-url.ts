/**
 * Single source of truth for the canonical site origin (no trailing slash).
 *
 * Resolution order:
 *  1. `NEXT_PUBLIC_SITE_URL` — explicit, wins everywhere (set this in prod).
 *  2. `VERCEL_URL` — Vercel preview/branch deploys (protocol-less host).
 *  3. Production with neither set → throw. This deliberately kills the old
 *     silent `scoutpaw.vercel.app` fallback so canonical/OG URLs can never
 *     point at the wrong domain in production.
 *  4. Local dev → `http://localhost:3000`.
 */
const LOCAL_FALLBACK = "http://localhost:3000";

export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (explicit) return explicit;

  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;

  if (process.env.VERCEL_ENV === "production") {
    throw new Error(
      "[seo] NEXT_PUBLIC_SITE_URL must be set in production — refusing to emit canonical/OG URLs for an unknown origin.",
    );
  }

  return LOCAL_FALLBACK;
}
