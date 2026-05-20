---
phase: 1
title: Extend rate-limit module
status: completed
priority: P2
effort: 20m
dependencies: []
---

# Phase 1: Extend rate-limit module

## Overview

Extend `lib/newsletter/rate-limit.ts` with two new check functions (`emailDedupAllowed`, `globalDailyAllowed` + `recordGlobalSend`) and tighten the existing per-IP `MAX` from 5 → 3. All three counters share the same in-memory pattern. No external state.

## Requirements

- Functional:
  - `rateLimitAllowed(ip)` — existing behavior, `MAX 3` per 60s window per IP
  - `emailDedupAllowed(email)` — returns `false` if normalized email submitted in last 60 min, else records + returns `true`
  - `globalDailyAllowed()` — returns `true` if today's send-count < 80
  - `recordGlobalSend()` — increments today's counter; resets on UTC day rollover
- Non-functional:
  - All state in `Map<string, ...>` — no external storage
  - Lazy cleanup: expired buckets pruned on next access (no `setInterval`)
  - Email normalized to lowercase + trim before keying (so `BOB@x.com` == `bob@x.com`)
  - UTC day key (`new Date().toISOString().slice(0, 10)`) — TZ-immune
  - File header comment notes multi-instance limitation (same as today)

## Architecture

```typescript
// lib/newsletter/rate-limit.ts

// (existing) per-IP
type Bucket = { count: number; resetAt: number };
const ipBuckets = new Map<string, Bucket>();
const IP_WINDOW_MS = 60_000;
const IP_MAX = 3;        // tightened from 5

export function rateLimitAllowed(ip: string): boolean { ... }

// (new) per-email dedup
const emailSeen = new Map<string, number>();   // key → expiresAt (ms epoch)
const EMAIL_TTL_MS = 60 * 60 * 1000;

export function emailDedupAllowed(email: string): boolean {
  const key = normalize(email);
  const now = Date.now();
  const expiresAt = emailSeen.get(key);
  if (expiresAt && expiresAt > now) return false;
  emailSeen.set(key, now + EMAIL_TTL_MS);
  return true;
}

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

// (new) global daily cap
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
```

## Related Code Files

- Modify: `lib/newsletter/rate-limit.ts`

## Implementation Steps

1. Read current `rate-limit.ts` to confirm shape
2. Change `MAX = 5` → `MAX = 3`; rename existing constants to `IP_*` prefix to disambiguate from new ones
3. Add `emailDedupAllowed` + `normalize` helper
4. Add `globalDailyAllowed` + `recordGlobalSend` + `rollDayIfNeeded` + `todayKey` helpers + module-level `globalDayKey`/`globalCount`
5. Update file header comment to note: in-memory pattern, multi-instance limitation, lazy cleanup strategy
6. `pnpm typecheck`

## Success Criteria

- [ ] `rateLimitAllowed` uses `IP_MAX = 3`
- [ ] `emailDedupAllowed("bob@x.com")` returns `true` first call, `false` second call within 60 min
- [ ] `emailDedupAllowed("BOB@x.com")` and `emailDedupAllowed("bob@x.com")` collapse to same key
- [ ] `globalDailyAllowed()` returns `true` until `recordGlobalSend()` called 80 times
- [ ] Calling `recordGlobalSend()` 81+ times → `globalDailyAllowed()` still false until day rollover
- [ ] Synthetic UTC-day rollover (mock `todayKey`) → counter resets to 0
- [ ] `pnpm typecheck` passes

## Risk Assessment

- **Risk:** `emailSeen` map grows unbounded with unique submissions
  - **Mitigation:** Lazy prune — on each access, check expiry; periodic full-sweep optional but YAGNI. At 80/day cap, max growth is bounded.
- **Risk:** Day-rollover timing edge cases (e.g., request at 23:59:59.999 UTC)
  - **Mitigation:** `todayKey` derives from `Date.now()` per call; race window is sub-ms and benign (over-counts by 1 max).
- **Risk:** `globalCount` in-memory means each Vercel function instance has its own counter — true cluster cap is `instances × 80`
  - **Mitigation:** Documented same as existing rate-limit. At pre-launch volume, single instance dominates. Upgrade path: Upstash KV.
