# Resend Delivery Debug: Root Cause Planning Session

**Date**: 2026-05-19 01:57
**Severity**: Critical
**Component**: Newsletter integration (`lib/newsletter/`, Vercel env vars, Resend SDK)
**Status**: Planned (no code changes yet, secret rotated)

## What Happened

Subscriber notifications aren't arriving despite yesterday's Resend migration appearing successful. Form submission returns `{ ok: true }` in the UI, but emails never land in team inbox (checked Gmail inbox + spam). The smoking gun: Resend dashboard **Logs tab shows zero send attempts**—the API endpoint isn't even being called.

Brainstorm + planning session identified most-likely root cause and planned a 4-phase debug/fix approach.

## The Brutal Truth

The Resend SDK implementation is correct. The environment variables (`NEWSLETTER_MODE`, `RESEND_API_KEY`, `TEAM_NOTIFICATION_EMAIL`) are simply not loaded in the production Vercel deployment. Either they were never set, set to the wrong scope (Preview vs Production), have a typo, or were set *before* the latest deploy (no redeploy after env var update = stale runtime).

This is crushing because the form handler has zero visibility into the failure. It calls the Resend SDK, gets back a success response (or times out silently), and returns `ok: true` to the user. The dispatcher doesn't check if env vars are *actually* populated before the call—it just assumes they are.

The real embarrassment: a valid Resend API key (`re_gRj3c7MN_NYCUt93ypz18gPU8h7GHGMNK`) was committed to `.env.local.example` during the migration, and nobody caught it. The file is a git-tracked template, not a runtime secret file. That key is now rotated, but it exposed exactly how confused the distinction is between template + runtime config.

## Technical Details

**Form submission flow (current state):**
1. User fills "Join the Pack" form, clicks submit
2. `app/api/newsletter/route.ts` → `lib/newsletter/index.ts` dispatcher
3. `process.env.NEWSLETTER_MODE === 'live'` → calls `subscribeResend`
4. `resend.emails.send()` with `from`, `to`, `subject`, `html`
5. Resend SDK returns `{ data: ..., error: null }` (or error object)
6. API returns `{ ok: true/false }` to client

**The breakage:**
- When `RESEND_API_KEY` is undefined or wrong in Vercel runtime, `resend.emails.send()` either:
  - Silently fails with an internal SDK error
  - Returns `{ data: null, error: { message: "Unauthorized" } }`
  - Times out and never resolves
- The handler doesn't log the failure (no structured logging yet)
- The dashboard never sees a send attempt (request never reaches Resend API)
- User sees `{ ok: true }` and assumes success

**Secondary discovery:**
Grep for "re_" in `.env.local.example` found the rotated key. File now needs a prominent header marking it as a template, not runtime config.

## Approach Decision: Logging + Health Endpoint (Chosen)

Evaluated three approaches; selected **Approach A: Logging + Secret-Guarded Health Endpoint**.

| Approach | Cost | Surface | Rationale |
|----------|------|---------|-----------|
| **A: Logging + health endpoint** | ~70 min | Permanent diagnostic surface | Next request to `/api/newsletter/health?key=$SECRET` reveals if env vars are loaded. Structured logging captures successes + failures. |
| **B: Logging only** | ~40 min | Requires Vercel function logs | Same visibility, but debugging requires SSH-ing into Vercel or waiting for log aggregation. Slower feedback loop. |
| **C: Custom domain verification** | ~20 min | Domain-specific | Premature—doesn't address root cause (env vars not loading). Adds DNS config complexity without solving the dispatch bug. |

**Chosen: Approach A.** The health endpoint is a ~20 min addition that provides a *permanent* diagnostic surface for the team. Next time an env var goes missing, a single request answers "are the secrets loaded?" instead of digging through logs.

## Four-Phase Implementation Plan

**Phase 1: Sanitize `.env.local.example` (5 min)**
- Strip the leaked Resend key (`re_gRj3c7MN_...` → `re_PLACEHOLDER`)
- Add prominent header: "TEMPLATE FILE — Copy to `.env.local` for local dev or paste values into Vercel dashboard for production"
- Add `DIAGNOSTIC_SECRET` placeholder and brief comment on health endpoint usage

**Phase 2: Structured Logging + PII Masking (20 min)**
- Create `lib/newsletter/mask-email.ts` — utility to redact user PII in logs
  - Input: `user@example.com` → Output: `u*****@example.com`
  - Never log the raw email address in production
- Update `resend-source.ts` to log:
  - On success: `{ ok: true, messageId: msg_abc123, to: "u*****@example.com" }`
  - On failure: `{ ok: false, error: "Unauthorized", debug: "RESEND_API_KEY may be unset" }`
- Log calls to `console.error()` (Vercel function logs capture stderr)

**Phase 3: Secret-Guarded Health Endpoint (20 min)**
- Add `GET /api/newsletter/health?key=$DIAGNOSTIC_SECRET`
- Secret guard: constant-time comparison via `node:crypto.timingSafeEqual` (no timing attacks)
- Fail-closed: if `DIAGNOSTIC_SECRET` is unset, endpoint returns 404 (not 200 with "unset" message)
- Response body (masks PII + never exposes actual secrets):
  ```json
  {
    "ok": true,
    "envVarsLoaded": {
      "NEWSLETTER_MODE": "live",
      "RESEND_API_KEY": "<set, not shown>",
      "TEAM_NOTIFICATION_EMAIL": "<set, not shown>"
    },
    "lastSendAttempt": {
      "timestamp": "2026-05-19T01:57:00Z",
      "status": "success",
      "recipient": "t*****@team.com",
      "error": null
    }
  }
  ```
- No raw keys, no raw email addresses, no machine-readable secrets in response

**Phase 4: Docs + Validation (15 min)**
- Update `docs/deployment.md` with "Health Endpoint" section explaining how to use it
- Update `docs/project-changelog.md` with entry: "Added diagnostic health endpoint for Resend delivery troubleshooting"
- Typecheck + lint + build
- Local smoke test: set `NEWSLETTER_MODE=stub`, verify endpoint returns 404 (secret unset); set `DIAGNOSTIC_SECRET=test123` locally, verify endpoint works and masks email

## Key Constraints & Decisions

**Why not expose the actual secrets in logs/endpoint?**
Leaking `RESEND_API_KEY` in a health endpoint is a security nightmare. Rotating keys becomes mandatory every time the endpoint is accessed. By masking (or omitting) actual values, we keep the diagnostic surface safe even if it's exposed to unauthorized callers.

**Why constant-time comparison for the secret?**
If we use `key === DIAGNOSTIC_SECRET`, an attacker can time how long the comparison takes to infer the secret character-by-character. `timingSafeEqual` ensures the comparison always takes the same time regardless of where the strings diverge.

**Why fail-closed (404 instead of 401)?**
If `DIAGNOSTIC_SECRET` is unset and we return 401 or "secret required," we're leaking that an endpoint exists. Returning 404 makes the endpoint invisible unless someone knows the exact URL and has the secret.

## Why This Matters

The Resend migration succeeded in code, but failed in *deployment*. The form handler has zero instrumentation to catch missing env vars. Without this debug work:
- User would have to wait 24h for Vercel logs to be searchable
- Or manually SSH into the function and grep stderr
- Or ask support to pull logs
- The root cause (env var misconfiguration) might be misattributed to Resend API instability

The health endpoint collapses the search space instantly: one GET request answers "are the secrets loaded?" If not, the next step is obvious (check Vercel dashboard).

## Lessons

1. **Committed template files must contain only placeholders, never real values.** A `.env.local.example` is git-tracked and visible to all. Treat it like documentation, not a safe place to store example credentials. During code review, grep for patterns like `re_[a-zA-Z0-9]{20,}` (Resend key format) and reject any commits with real keys.

2. **When a deploy "works" in tests but fails in production, check the service-side dashboard first.** If Resend's Logs tab shows zero send attempts, the request isn't reaching Resend. This immediately rules out Resend infrastructure issues and points to the dispatch layer. The form handler must be the culprit.

3. **Fail-closed diagnostics are safer than open ones.** An endpoint that returns 404 when secrets are unset is better than one that returns 401 or "secret required." It prevents information leakage and doesn't telegraph that a diagnostic surface exists.

4. **Structured logging with PII masking is table stakes for production tracing.** Raw email addresses in logs are a compliance nightmare. Masking (even basic `u*****@example.com`) keeps logs safe to share, search, and aggregate.

## Next Steps

1. Delegate Phase 1 & 2 (env cleanup + logging, ~25 min)
2. Delegate Phase 3 & 4 (health endpoint + docs + validation, ~35 min)
3. After implementation: manual verification (set secrets in Vercel, resubmit form, check health endpoint, verify email arrives)
4. Post-launch: consider adding structured correlation IDs to link form submission → Resend message ID in logs (follow-up initiative)

---

**Session artifacts:**
- Brainstorm report: `plans/260518-1415-join-the-pack-resend-notify/reports/brainstorm-260519-0157-resend-delivery-debug.md`
- Plan directory: `plans/260519-0157-resend-delivery-debug/`
- Leaked key: Rotated during session (new key issued by Resend)
