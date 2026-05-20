# Brainstorm — Newsletter Anti-Spam Hardening

**Date:** 2026-05-19 05:25 (Asia/Saigon)
**Branch:** main
**Scope:** Audit existing anti-spam on the "Join the Pack" form + close real gaps. Pre-launch.

---

## Problem Statement

Audit the newsletter subscription pipeline (`POST /api/newsletter`) for anti-spam coverage and add the minimum protections that close real gaps without harming UX.

## Audit Findings — Current State

| Protection | Status | Where |
|---|---|---|
| Honeypot (off-screen field) | ✅ Good | `components/home/newsletter-cta.tsx` + `app/api/newsletter/route.ts:31` |
| Per-IP rate limit (5/min) | ✅ Adequate (in-memory, per-instance) | `lib/newsletter/rate-limit.ts` |
| Zod email validation | ✅ Good | `lib/newsletter/schemas.ts` |
| HTML-escape user fields in email | ✅ Good | `lib/newsletter/resend-source.ts` |
| Email dedup (same email, repeated) | ❌ Missing | — |
| Global daily quota cap | ❌ Missing | — |
| Tag field max length | ⚠️ Unbounded | `lib/newsletter/schemas.ts` |
| CAPTCHA | ❌ Absent (intentional) | — |
| Distributed rate limit | ⚠️ In-memory only | Known MVP limitation |

**Verdict:** Strong baseline. Two real gaps: duplicate-email annoyance (team UX) + Resend quota guard (account safety).

## Threat Model (Realistic)

- ✅ Already covered: random scanners, simple bots, accidentally double-submit
- ⚠️ Real risk: Resend quota drain by adversary or by viral burst exceeding 100/day free tier
- ❌ Not in scope: credential stuffing, DDoS-class traffic, headless-browser bots that bypass honeypot (low realistic risk for kids' cartoon brand)

## Decisions Locked (User-Confirmed)

| Decision | Value |
|---|---|
| Approach | A — minimal hardening |
| Dedup behavior | Silent (`{ok: true}`, no email, no error to user) |
| Global daily cap | 80/day, generic error message |
| Tag max length | 64 chars |
| Per-IP rate | Tightened from 5/min → 3/min |
| Launch state | Pre-launch (preventive) |
| CAPTCHA | Skipped (not needed at scale) |

## Approaches Evaluated

### A. Minimal hardening — **CHOSEN**
- Email-based dedup (60-min TTL, silent)
- Global daily counter (cap at 80, daily reset)
- `z.string().max(64)` on tag
- Per-IP `MAX 3` (down from 5)
- ~40 LOC, single module extension, no external deps

### B. + Cloudflare Turnstile
- Adds invisible CAPTCHA
- Pros: blocks 95%+ bots
- Cons: external dep, latency, CF outage risk, requires CF account
- **Rejected**: overkill at current scale; honeypot adequate

### C. Do nothing
- Existing protection IS sufficient for documented threat model
- **Rejected**: dedup + global cap are real value for ~40 LOC

## Final Solution Design

### File Changes

| Path | Action | Purpose |
|---|---|---|
| `lib/newsletter/rate-limit.ts` | extend | Add per-email bucket + global daily counter; tighten `MAX` to 3 |
| `lib/newsletter/schemas.ts` | tweak | Add `.max(64)` to tag |
| `app/api/newsletter/route.ts` | extend | Call new checks (`emailDedupAllowed`, `globalDailyAllowed`) after existing rate-limit |

### Module Shape (single file: `rate-limit.ts`)

```typescript
// Per-IP rate limit (existing, tightened)
export function rateLimitAllowed(ip: string): boolean { /* 3 per 60s */ }

// Per-email dedup — returns false if email submitted in last 60 min
export function emailDedupAllowed(email: string): boolean { /* TTL bucket */ }

// Global daily counter — returns false once 80 sends reached today
export function globalDailyAllowed(): boolean { /* counter with midnight reset */ }
export function recordGlobalSend(): void { /* call AFTER successful subscribe */ }
```

### Route Flow

```
POST /api/newsletter
  → parse JSON
  → Zod validate (now includes tag.max(64))
  → honeypot check (existing)
  → rateLimitAllowed(ip) → 429 if exceeded
  → emailDedupAllowed(email) → silently return {ok: true} if duplicate
  → globalDailyAllowed() → return {ok: false, error: "temporarily unavailable"} if cap hit
  → subscribe(req)
  → if subscribe returned ok → recordGlobalSend()
```

### Storage Model

All in-memory `Map` (same caveat as existing `rate-limit.ts`):
- Per-IP: 60-second TTL bucket (existing)
- Per-email: 60-min TTL bucket (new)
- Global daily: counter + day-key; resets when day changes

Multi-instance limitation documented in same file. At <100/mo volume, acceptable. Upgrade path: Upstash KV when traffic warrants.

### Edge Cases Handled

- Day-rollover: when current calendar day != stored day → reset counter to 0
- Email normalization: lowercase + trim before hashing into dedup key (so `BOB@x.com` and `bob@x.com` dedupe)
- Stub mode: dedup + global cap still apply (consistent behavior); could optionally bypass for dev but not worth the conditional
- Honeypot triggered: returns `ok: true` WITHOUT entering any rate-limit/dedup/cap path (existing)

## Implementation Considerations & Risks

| Risk | Mitigation |
|---|---|
| Dedup memory grows unbounded with unique emails | Lazy cleanup: when bucket TTL expires, prune on next access. Same pattern as existing rate-limit. |
| Day-rollover bug (timezone-sensitive) | Use server's `new Date().toISOString().slice(0, 10)` as day key — UTC date, immune to TZ shifts |
| Global cap blocks legitimate viral spike | Pre-launch low-risk; if launch goes viral, raise cap or add Upstash KV |
| Silent dedup confuses legitimate user who forgot they signed up | UX trade-off accepted (chose silent over visible "already subscribed") |
| Cap reached → all forms fail until next day | Acceptable: generic error message tells user to retry later; team gets log alert if/when this happens |

## Security Considerations

- No PII (email values) ever stored in logs — dedup uses email as map key, never logs it
- Global cap protects Resend account from auto-suspension under attack
- Tag max length prevents trivial bytes-amplification in email body

## Success Metrics

- ✅ Submitting same email twice within 60 min → only 1 team email
- ✅ Submitting 80 unique emails in one day → 81st returns clean error
- ✅ Submitting 4 times in 60s from one IP → 4th returns 429
- ✅ Submitting `tag` with 65+ chars → Zod error
- ✅ Day rollover (UTC) → counter resets
- ✅ Existing honeypot + Resend success path unchanged
- ✅ `pnpm typecheck` + `pnpm lint` pass

## Next Steps

1. User confirms approach (DONE)
2. Create plan via `/ck:plan`
3. Implement via `/ck:cook`
4. Validate locally with stub mode (dedup + cap visible in `[newsletter] dispatch` logs)

## Unresolved Questions

- Should the global cap have a per-tag breakdown (e.g., 60 for home, 20 for coming-soon)? Not now — single bucket is simpler and YAGNI applies.
- Should we add a webhook/alert when global cap is hit? Not now — Vercel function log line is sufficient at this scale.
- Should dedup TTL be 60 min or longer (e.g., 24 h)? 60 min chosen because longer windows penalize legitimate re-subscription attempts after the user clears mail/changes mind. Adjustable later.
