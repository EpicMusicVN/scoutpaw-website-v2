/**
 * In-memory anti-abuse counters for the newsletter pipeline.
 *
 * Three independent checks share this module:
 *   - rateLimitAllowed(ip)        per-IP burst guard (3 / 60s)
 *   - emailDedupAllowed(email)    silently dedupe repeat submits (60-min TTL)
 *   - globalDailyAllowed()/recordGlobalSend()
 *                                  daily cap (80 / UTC day) to protect
 *                                  Resend's free-tier quota (100/day)
 *
 * State is per-serverless-instance — fine at <100/mo. Cluster-wide cap is
 * effectively `instances × MAX`. Upgrade path: Upstash KV when traffic
 * warrants distributed counters.
 *
 * Cleanup is lazy: expired buckets are pruned on next access (no setInterval,
 * no background sweep). At capped volumes the map cannot grow unbounded.
 */

// ---------- Per-IP rate limit ----------

type Bucket = { count: number; resetAt: number };

const ipBuckets = new Map<string, Bucket>();
const IP_WINDOW_MS = 60_000;
const IP_MAX = 3;

export function rateLimitAllowed(key: string): boolean {
  const now = Date.now();
  const bucket = ipBuckets.get(key);
  if (!bucket || bucket.resetAt < now) {
    ipBuckets.set(key, { count: 1, resetAt: now + IP_WINDOW_MS });
    return true;
  }
  if (bucket.count >= IP_MAX) return false;
  bucket.count += 1;
  return true;
}

// ---------- Per-email dedup ----------

const emailSeen = new Map<string, number>();
const EMAIL_TTL_MS = 60 * 60 * 1000;

/**
 * Returns false if the same email (case-insensitive, trimmed) was already
 * accepted in the last EMAIL_TTL_MS. Records the email on success so the
 * next call within the window will be deduped.
 */
export function emailDedupAllowed(email: string): boolean {
  const key = email.trim().toLowerCase();
  const now = Date.now();
  const expiresAt = emailSeen.get(key);
  if (expiresAt && expiresAt > now) return false;
  emailSeen.set(key, now + EMAIL_TTL_MS);
  return true;
}

// ---------- Global daily cap ----------

const GLOBAL_DAILY_CAP = 80;
let globalDayKey = "";
let globalCount = 0;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function rollDayIfNeeded(): void {
  const today = todayKey();
  if (today !== globalDayKey) {
    globalDayKey = today;
    globalCount = 0;
  }
}

export function globalDailyAllowed(): boolean {
  rollDayIfNeeded();
  return globalCount < GLOBAL_DAILY_CAP;
}

export function recordGlobalSend(): void {
  rollDayIfNeeded();
  globalCount += 1;
}
