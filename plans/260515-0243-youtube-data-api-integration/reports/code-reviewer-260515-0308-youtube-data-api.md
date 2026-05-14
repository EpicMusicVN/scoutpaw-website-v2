# Code Review — YouTube Data API v3 Integration (Cycle 5)

**Date:** 2026-05-15
**Reviewer:** code-reviewer
**Scope:** lib/youtube/* (new), lib/content/schemas.ts, content/channels.json, content/videos.json, app/watch/page.tsx, components/watch/{our-channels,explore-videos,video-rail}.tsx, next.config.ts, .env.local.example

---

## Overall Assessment

Solid integration. Failure-safe by design — every error path returns `[]` so the page falls back to JSON. Graceful degradation, no thrown exceptions escape the API boundary, no secrets leaked, and the Next.js cache directive is correct. Approve to ship; minor non-blocking nits below.

---

## Critical Issues

None.

---

## High Priority

None.

---

## Medium Priority

### M1. `enrichVideos` placeholder skip — `id &&` guard is technically dead code

In `lib/youtube/enrich.ts:36-37`:

```ts
const ids = videos
  .map((v) => v.youtubeId)
  .filter((id) => id && !id.startsWith("TODO_"));
```

`VideoSchema.youtubeId = z.string().min(1)` — already required + non-empty. The `id &&` short-circuit can never trigger. Not a bug, just lint noise.

Recommendation: drop `id &&`, leave `!id.startsWith("TODO_")`. Or keep as defensive — your call. No impact.

### M2. API key error path is silent — diagnostics may suffer in prod

`client.ts:65-67` and `109-111`:

```ts
} catch {
  return [];
}
```

Empty catch swallows: rate-limit errors, malformed JSON, network timeouts, etc. In prod, if YouTube quota is exhausted or the key is revoked, the site silently falls back to JSON forever (or rather, 1hr at a time). No log, no alert.

Recommendation: at minimum, `console.warn` the error in the catch. Better: log enough to triage (status code + reason). Without leaking the key — log `err.name + err.message`, not the full URL. Decision left to user; YAGNI argument applies for MVP.

### M3. Non-OK response is also silent

`client.ts:39` and `80`: `if (!res.ok) return [];` — same as M2 but for HTTP error responses (403 quota, 400 bad-key, 5xx). At least log `res.status + res.statusText`.

---

## Low Priority

### L1. `enrichVideos` placeholder-skip leaves enriched array missing TODO entries — confirmed safe but worth a comment

The map at `enrich.ts:41-54` iterates all videos (including TODO_*). `byId.get(v.youtubeId)` returns `undefined` for TODOs (since they weren't fetched), so the fallback path `if (!live) return v` keeps the JSON version. Verified end-to-end: mock-007 with `TODO_youtube_id_7` returns the JSON entry untouched. Good.

The current code comment ("Skips placeholder IDs") could be clearer that "skips" means "doesn't fetch — still returns the JSON version, untouched."

### L2. Featured-video-only enrichment is a 2nd API call for an already-enriched video

`app/watch/page.tsx:30-32`:

```ts
enrichVideos(rawVideos),        // call 1: fetches all 30 video IDs
enrichVideos([rawFeatured]),    // call 2: fetches the featured one again
```

The Next.js fetch memoization documented at https://nextjs.org/docs/app/api-reference/functions/fetch — *Memoization applies to GET requests with the same URL and options during a single render pass*. Call 1 fetches a batched URL with all 30 IDs; call 2 fetches a different URL (single ID). Different URLs → no memoization → 2 API requests on cold revalidate instead of 1.

Quota math: still negligible (4 calls per cold revalidate: 1 channels.list + 2 videos.list batched + 1 videos.list single = ~4 units/hr = 96/day, well under 10k). Not a fix-now issue, but if you want symmetry, you could derive the enriched featured from `videos.find((v) => v.id === rawFeatured.id)` and drop the second enrich call entirely.

### L3. `bannerColor` removal — verified safe

Grepped all `.bannerColor` usage outside `*.json`. Only consumer is `our-channels.tsx` (lines 160, 161, 198, 199). All four sites already use truthy guard with optional-chain-or-fallback. Schema relaxation does not break anything.

### L4. `channelSlug` dropped from videos — verified safe

Grepped `.channelSlug` outside `*.json`. Only consumer is `app/watch/page.tsx:39-40`:

```ts
const featuredChannel = featured?.channelSlug
  ? channels.find((c) => c.slug === featured.channelSlug) ?? null
  : null;
```

The optional-chain `featured?.channelSlug` correctly handles the undefined case → `featuredChannel = null`. `WatchHero` types accept `channel?: Channel | null` (confirmed line 20). No UI crash, just no "channel" badge on the hero. Expected behavior per the data simplification.

### L5. `yt3.googleusercontent.com` + `yt3.ggpht.com` — both correct

These are the actual YouTube CDN hostnames for channel avatars. `yt3.googleusercontent.com` is the modern primary; `yt3.ggpht.com` is the legacy alias still served by Google. Allowlisting both is the safe play.

### L6. `parseISODuration` returns `""` for unparseable input — caller falls back

Verified `enrich.ts:48` — `live.duration || v.duration`. Empty string is falsy → falls back to JSON duration. Correct.

### L7. Type-narrowing in client.ts — clean

Inline structural types are used (`as { items?: Array<{ ... }> }`). All nested fields are nullable-handled via `?.` chains and `?? ""` / `?? undefined` defaults. No `any` escapes. `pickThumb` chain handles all-undefined gracefully. Numeric parse on subscriber/view counts uses `Number()` which returns `NaN` for invalid input — minor edge case, but YouTube always returns numeric strings here, so probably fine. If paranoid: `Number.isFinite(n) ? n : undefined` wrapper.

### L8. `revalidate: 3600` — confirmed correct App Router syntax

Per https://nextjs.org/docs/app/api-reference/functions/fetch v16.2.6 (current). Same-URL fetch is auto-memoized within a render pass, so the channel list + video list inside a single page render won't double-fetch even without explicit dedup. Good.

### L9. Server-only API key — confirmed

`process.env.YOUTUBE_API_KEY` only in `lib/youtube/client.ts`. No `NEXT_PUBLIC_` prefix anywhere. `lib/youtube/*` has no `"use client"` directives. Used only from `app/watch/page.tsx` which is an async server component. No client-side leak. The query-param `&key=...` in the URL stays on the server — never serialized to the response stream.

### L10. URL encoding — `encodeURIComponent` not used on `id` param

`client.ts:35`: `ids.slice(0, MAX_IDS_PER_CALL).join(",")`. YouTube channel/video IDs are URL-safe by design (alphanumeric + dash + underscore), so no encoding bug today. If a malformed ID ever reaches the function, the API would 400 it (caught by `!res.ok`). Defensive practice would `.map(encodeURIComponent)` first, but not required.

---

## Edge Cases Found by Scout

### EC1. Cache stampede — negligible at current scale

Next.js dedupes same-URL fetches *within* a single render pass. Cross-render deduplication relies on the cache layer (`force-cache` semantics + `revalidate: 3600`). On cold cache, N concurrent requests *could* race to populate. Per Next.js's caching layer, this is handled at the framework level (single-flight via revalidation lock). Not a concern at MVP traffic.

### EC2. JSON channel without `youtubeChannelId` still works

`enrich.ts:11-17` — filter returns only channels with the field; `map` at line 16 falls back to JSON for any without it. Verified: if you ever add a 5th non-YouTube channel, no breakage.

### EC3. Mismatch between requested + received IDs

YouTube may omit IDs from the response if a channel/video was deleted. `byId.get(id)` returns undefined → JSON fallback. Verified safe.

### EC4. Quota math — 96 units/day worst case

2 fetchVideos batches (one all-IDs, one single-featured) + 1 fetchChannels = 3 calls per cold revalidate, 24 revalidates/day = 72 units. Free tier 10,000/day. Plenty of headroom.

### EC5. ZodObject default behavior — extra keys are stripped, not rejected

`ChannelsFileSchema = z.object({ channels: array(ChannelSchema) })` — defaults to `.strip()`, so any extra keys (e.g. `youtubeChannelId` before the schema knew about it) wouldn't throw. Now that schema knows about it, the value is preserved. No issue.

---

## Positive Observations

- Failure modes are uniformly `return []` — clean contract; no `try/catch` needed in callers
- Schema additions are *additive* + optional → no breaking change
- Empty-state copy is consistent across video-rail + explore-videos
- `next.config.ts` allowlist covers both modern + legacy YouTube CDN hostnames
- API key never logged, never sent to client, comment in `.env.local.example` reminds operators about Google Cloud Console HTTP-referrer restriction
- Type-only imports (`import type`) used appropriately in `enrich.ts` + `client.ts`
- 4 channels with real YouTube IDs aligns content with reality — no mock pollution

---

## Recommended Actions

1. **(Optional, M2/M3)** Add `console.warn` in both `catch` blocks + after `!res.ok` for prod observability. ~4 lines total.
2. **(Optional, M1)** Remove redundant `id &&` guard in `enrich.ts:37`. 1 char delete.
3. **(Optional, L2)** Eliminate the duplicate `enrichVideos([rawFeatured])` call by deriving the featured video from the already-enriched array. ~3 lines refactor.

None of the above are blockers. Ship as-is is acceptable.

---

## Metrics

| Metric | Value |
|---|---|
| Files reviewed | 11 |
| Type errors | 0 (pnpm typecheck clean per user) |
| Lint errors | 0 (pnpm lint clean per user) |
| Critical issues | 0 |
| High priority | 0 |
| Medium priority | 3 (all optional logging/cleanup) |
| Low priority | 10 (all verified-safe notes) |

---

## Unresolved Questions

None. All review priorities (1-10 from prompt) verified.

---

**Status:** DONE
**Summary:** YouTube Data API integration cycle 5 is production-ready. All 10 priority checks pass. No critical or high-severity issues. Three optional medium-priority cleanups (silent error logging, dead `id &&` guard, duplicate enrichVideos call for featured) are observability/code-cleanliness wins, not bugs.
**Concerns/Blockers:** None blocking. The silent error swallowing (M2/M3) is the only one I'd consider revisiting before scaling beyond MVP traffic — without logs, a key revocation or quota exhaustion would look like "site still works" but actually means "running on cached JSON forever."
