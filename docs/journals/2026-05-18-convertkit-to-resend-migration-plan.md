# ConvertKit → Resend Migration: Plan & Rationale

**Date**: 2026-05-18 14:15
**Severity**: Medium
**Component**: Newsletter integration (`app/api/newsletter/route.ts`, `lib/newsletter/`)
**Status**: Planned (no code changes yet)

## What Happened

Completed research and planning session to replace ConvertKit newsletter integration with Resend transactional email for the "Join the Pack" form on scoutpaw-v2. Session was planning-only—no code modified.

## Scouting Summary

Identified existing ConvertKit code footprint:
- Entry point: `app/api/newsletter/route.ts` (POST handler)
- Source implementations: `lib/newsletter/convertkit-source.ts` (live), `stub-source.ts` (dev)
- Shared: `index.ts` (dispatch), `schemas.ts` (Zod validation), `rate-limit.ts`
- UI: `components/home/newsletter-cta.tsx`

## Decision: Resend Over Alternatives

Evaluated three options; chose **Resend** for production.

| Option | Rationale | Status |
|--------|-----------|--------|
| **Resend** | 3K free/mo (>10x our <100/mo volume), clean SDK, Vercel-native, SMTP fallback | ✅ Chosen |
| Web3Forms/Formspree | Overkill (designed for static sites), inflexible no-code UI, harder API mapping | ❌ Rejected |
| Nodemailer + Gmail | Brittle on Vercel (SMTP unstable), requires credential cycling, token management hell | ❌ Rejected |

## Architecture: Minimal Source Swap

Preserve existing abstraction layer—this is a **source-layer replacement**, not a rewrite.

**API contract remains unchanged:**
```json
{
  "ok": true | false,
  "error?": "string"
}
```

**Preserved across migration:**
- `lib/newsletter/schemas.ts` (Zod validation)
- `lib/newsletter/rate-limit.ts` (honeypot + rate limiting)
- `lib/newsletter/index.ts` (dispatch logic)
- `NEWSLETTER_MODE=stub` dev mode (zero API keys required)

**Implementation scope:**
- Create `lib/newsletter/resend-source.ts` (parallel to convertkit-source.ts)
- Swap dispatcher in `index.ts` to call resend-source
- Delete convertkit-source.ts and ConvertKit deps

## Key Constraints Accepted

**Sender address**: `onboarding@resend.dev` (initial)
- Resend-owned domain, requires zero DNS setup
- Restriction: only deliverable to Resend account owner's inbox (our team notification email)
- This is intentional—form is team-notification-only, not subscriber acquisition
- Post-launch, separate plan will handle domain verification (`notifications@scoutpaw.tv`)

**Subscriber storage**: Not in scope
- No database changes; no welcome email flow
- Resend integrates for transactional delivery only

**Volume ceiling**: <100/mo safely within 3K free tier

## Why This Matters

ConvertKit is overcomplicated for a simple team notification form. Resend is:
- **Simpler**: Single API call, no webhook choreography
- **Cheaper**: Free tier covers our volume 30x over
- **Vercel-native**: Instant compatibility, no credential management pain
- **Flexible**: Easy to add welcome flows later without rearchitecting

## Deferred Decisions

- Domain verification (post-launch, separate initiative)
- Welcome email sequence (out of scope; team-only for now)
- Subscriber storage in Postgres (future phase)

## Implementation Plan

Four-phase rollout saved to `plans/260518-1415-join-the-pack-resend-notify/`:

1. **Phase 1**: Install Resend SDK, set env vars (`RESEND_API_KEY`)
2. **Phase 2**: Implement `resend-source.ts`, swap dispatcher, preserve stub mode
3. **Phase 3**: Delete ConvertKit code, update `docs/deployment.md` and `project-changelog.md`
4. **Phase 4**: Typecheck, lint, run test suite (stub + live + error cases)

Detailed phase files in plan directory.

## Lessons

- **Always question inherited complexity**: ConvertKit's newsletter CMS was solving a problem we don't have (subscriber management, email sequences). Transactional-only tools fit tight.
- **Preserve abstractions during migrations**: By keeping the source layer intact, we avoid rewriting the entire form handler and can roll back easily if Resend fails.
- **Free tier headroom matters**: 3K free/mo vs <100/mo actual volume = zero pressure, safer to experiment.

## Next Steps

1. Delegate Phase 1 & 2 implementation (deps + Resend source layer)
2. Delegate Phase 4 testing (stub, live, error cases—no domain verification yet)
3. After tests pass: code review, then merge
4. Plan separate initiative for domain verification post-launch

---

**Report files:**
- Brainstorm: `plans/reports/brainstorm-260518-1415-join-the-pack-resend-notify.md`
- Plan directory: `plans/260518-1415-join-the-pack-resend-notify/`
