/**
 * Simple in-memory rate limit. Resets per serverless instance — fine for MVP.
 * Upgrade to Upstash KV later if traffic warrants distributed limits.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();
const WINDOW_MS = 60_000;
const MAX = 5;

export function rateLimitAllowed(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (bucket.count >= MAX) return false;
  bucket.count += 1;
  return true;
}
