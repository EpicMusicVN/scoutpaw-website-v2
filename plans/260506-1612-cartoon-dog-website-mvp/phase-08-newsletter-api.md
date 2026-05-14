---
phase: 8
title: Newsletter API
status: completed
priority: P1
effort: 2h
dependencies:
  - 1
---

# Phase 8: Newsletter API

## Overview
Server route handler `/api/newsletter` accepts email signups. ConvertKit not set up yet → **stub mode** for MVP: log payload to server console, return 200 success. When ConvertKit ready, set `NEWSLETTER_MODE=live` + provide API key/form ID — same contract, real subscriptions. Validates input via Zod, supports tags (for Coming Soon segmentation), rate-limited by IP.

## Requirements
- Functional: POST email + optional tag → create ConvertKit subscriber w/ tag → return 200/400/429/500
- Non-functional: ConvertKit API key NEVER in client bundle; basic rate limit (5 req/min/IP); honeypot field rejected silently

## Architecture
- `app/api/newsletter/route.ts` — Next.js Route Handler (server-only)
- Body schema: `{ email: string, tag?: string, hp?: string }` (hp = honeypot, must be empty)
- Calls ConvertKit `POST /v3/forms/{form_id}/subscribe` (or v4 equivalent)
- Rate limit: in-memory LRU map (process-local — fine for low traffic; upgrade to Upstash if needed later)
- Tags: passed as comma-separated to ConvertKit subscribe API

## Related Code Files
- Create: `app/api/newsletter/route.ts`
- Create: `lib/newsletter/convertkit.ts` (client wrapper)
- Create: `lib/newsletter/stub.ts` (MVP mode — log + 200)
- Create: `lib/newsletter/index.ts` (selects via `NEWSLETTER_MODE` env)
- Create: `lib/newsletter/rate-limit.ts` (simple LRU)
- Create: `lib/newsletter/schemas.ts` (Zod request/response shapes)

## Implementation Steps
1. Define Zod schema `NewsletterRequestSchema` (email format, optional tag, optional hp)
2. `convertkit.ts` wrapper: `subscribe({ email, tags? })` → calls ConvertKit API w/ env vars (`CONVERTKIT_API_KEY`, `CONVERTKIT_FORM_ID`)
3. `rate-limit.ts`: in-memory LRU keyed by IP, 5 requests / 60s, returns boolean allowed
4. Route handler:
   - Parse body via Zod → 400 on invalid
   - Reject if `hp` field non-empty (silent 200, log warn)
   - Rate-limit by `x-forwarded-for` → 429 if over
   - Call `convertkit.subscribe()` → handle errors (network, 4xx, 5xx)
   - Return `{ ok: true }` or `{ ok: false, error: string }`
5. Add CORS headers (same-origin only — Next.js default is fine)
6. Log errors to console (Vercel captures); no sensitive data in logs

## Success Criteria
- [ ] POST `/api/newsletter` w/ valid email + tag → 200, ConvertKit shows new subscriber w/ tag
- [ ] Invalid email → 400 with clear error message
- [ ] Honeypot filled → 200 but NOT subscribed (silent reject)
- [ ] 6th request from same IP within 60s → 429
- [ ] API key NOT exposed in client bundle (verify build)
- [ ] ConvertKit downtime → 502/503 returned, client shows error state

## Risk Assessment
- In-memory rate limit resets per serverless instance — acceptable for MVP; Upstash KV upgrade path documented
- ConvertKit API changes (v3 → v4) — pin endpoint version, monitor deprecation
- Email enumeration attack (subscribe endpoint reveals existing emails) — ConvertKit returns same response for new/existing, so safe
- No double-opt-in by default — enable in ConvertKit form settings (compliance)
