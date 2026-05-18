---
phase: 3
title: "Deploy and CDN Purge"
status: pending
priority: P2
effort: "30m"
dependencies: [2]
---

# Phase 3: Deploy and CDN Purge

## Overview

Ship Phase 1+2 to production, then manually purge Cloudflare cache for the four affected R2 image URLs so stale copies stop serving.

## Requirements

- Production deploy succeeds (Vercel or active host).
- All four shop image URLs return fresh bytes post-purge (verified via `cf-cache-status` headers).
- Old `shop/promotion.png` also purged (defensive — even though no longer referenced).

## Implementation Steps

### 1. Deploy

Standard deploy flow (commit → push → host build). Confirm deploy succeeds before purging.

### 2. Cloudflare cache purge

Resolve `<R2_BASE>` from `NEXT_PUBLIC_R2_BASE_URL`. Purge these URLs:

- `<R2_BASE>/assets/shop/1.png`
- `<R2_BASE>/assets/shop/2.png`
- `<R2_BASE>/assets/shop/banner.png`
- `<R2_BASE>/assets/shop/promotion.jpg`
- `<R2_BASE>/assets/shop/promotion.png` (legacy — defensive purge)

Use either:
- **Dashboard**: Caching → Configuration → Purge Cache → Custom Purge → paste URLs.
- **API**:
  ```bash
  curl -X POST "https://api.cloudflare.com/client/v4/zones/$ZONE_ID/purge_cache" \
    -H "Authorization: Bearer $CF_API_TOKEN" \
    -H "Content-Type: application/json" \
    --data '{"files":["<R2_BASE>/assets/shop/1.png","<R2_BASE>/assets/shop/2.png","<R2_BASE>/assets/shop/banner.png","<R2_BASE>/assets/shop/promotion.jpg","<R2_BASE>/assets/shop/promotion.png"]}'
  ```

### 3. Verify purge took effect

For each URL:
```bash
curl -I <url>
```
- First hit: expect `cf-cache-status: MISS` (or `EXPIRED`).
- Second hit (rerun): expect `cf-cache-status: HIT`.
- Verify `content-length` differs from pre-purge size if you noted it (extra confidence).

### 4. Audit Cache-Control headers (one-time advisory)

```bash
curl -sI <R2_BASE>/assets/shop/1.png | grep -i cache-control
```

If headers include `immutable` or `max-age` > 30 days, browser cache will outlast purges. Recommend (separate task) configuring R2 objects to `public, max-age=300, s-maxage=86400, stale-while-revalidate=60`. Out of scope for this plan; note in changelog.

## Success Criteria

- [ ] Production deploy succeeds (host build status green)
- [ ] All 5 URLs purged via dashboard or API (200 response from purge endpoint)
- [ ] `curl -I` on each URL shows `cf-cache-status: MISS` on first post-purge request
- [ ] Repeat `curl -I` shows `HIT` on subsequent requests (cache populating correctly)
- [ ] Browser hard-reload (Ctrl+Shift+R) on home + shop pages shows new images

## Risk Assessment

| Risk | Mitigation |
|------|------------|
| Browser cache (not CDN) holds stale image | Hard-reload (Ctrl+Shift+R) bypasses browser cache. Document for any non-dev viewers. |
| `next/image` runtime cache still serves stale optimized variant | Force a fresh deploy (already happening) — next/image cache is per-build for Vercel. |
| Wrong `R2_BASE` URL purged (e.g. dev vs prod bucket) | Verify `NEXT_PUBLIC_R2_BASE_URL` from production env before purging. |
| Missing Cloudflare access | Surface in advance; if no API token/dashboard, plan blocks here until access is granted. |

## Security Considerations

- Cloudflare API token: do not commit or echo; use env or 1Password ref.
- Purge endpoint requires scoped token (zone:purge_cache) — least privilege.
