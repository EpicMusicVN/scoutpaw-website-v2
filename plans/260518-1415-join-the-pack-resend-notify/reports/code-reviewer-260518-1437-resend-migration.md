# Code Review — ConvertKit → Resend Migration

**Verdict:** SHIP WITH NOTES
**Status:** DONE_WITH_CONCERNS
**Summary:** Migration is clean, type-safe, and SDK-correct. Two stale ConvertKit references in `docs/codebase-overview.md` and a stale comment in `stub-source.ts` should be cleaned. Email subject is plaintext — safe, but flag header-injection consideration.

---

## Scope
- Files reviewed: `lib/newsletter/resend-source.ts` (NEW, 70 LOC), `lib/newsletter/index.ts`, `.env.local.example`, `docs/deployment.md`, `docs/project-changelog.md`, `package.json`, deletion of `convertkit-source.ts`.
- Validation cross-checked: callers (`app/api/newsletter/route.ts`), stub-source, rate-limit, form caller (`components/home/newsletter-cta.tsx`), Resend SDK v6.12.3 types at `node_modules/resend/dist/index.d.cts`.

## Critical
None.

## High
**H1. Stale ConvertKit references in docs/code** — your grep was correct for active code paths, but missed:
- `docs/codebase-overview.md` lines 12, 21, 44, 67, 85 — five mentions of ConvertKit in the architecture summary table and tree. Will mislead new devs and any LLM context build.
- `lib/newsletter/stub-source.ts:5` — JSDoc still says *"before the real ConvertKit account is provisioned"*.
Fix: update both. The latter is a 1-line comment swap.

## Medium
**M1. Subject line plaintext email injection (low risk, defensive only)** — `subject: \`New ScoutPaw subscriber: ${req.email}\`` interpolates user-supplied (Zod-validated) email. Zod `z.string().email()` rejects newlines and quotes in the local part per RFC, so SMTP header injection isn't reachable via this code path. Still: prefer keeping subject static (`"New ScoutPaw subscriber"`) and put email in body only. One-line hardening, eliminates an entire vulnerability class if Zod is ever loosened.

**M2. `error.name` is a fixed enum, not arbitrary** — confirmed against `RESEND_ERROR_CODE_KEY` union in SDK types. Safe to log. No data leak. Noting for the record since the prompt asked.

**M3. `tag` field is reachable via API direct-POST.** Schema accepts arbitrary `z.string().optional()` — attacker can pass 100KB strings or weird unicode. Honeypot + rate-limit (5/min/IP) bound the damage, and you already HTML-escape. Consider `z.string().max(64).optional()` for belt-and-braces. Not blocking.

## Low
- **L1.** `process.env.NEWSLETTER_FROM_EMAIL ?? "onboarding@resend.dev"` silently masks misconfig. Consider warning when fallback hits in prod.
- **L2.** Route returns `502` on `{ok: false}`, including the *misconfig* case (M1 in your concerns). Misconfig is arguably `500/503`, but `502` is acceptable for "upstream-ish" failure. Cosmetic.

## Behavioral Checklist
- [x] Concurrency — no shared mutable state in new file. `new Resend(apiKey)` per-call is intentional and cheap.
- [x] Error boundaries — try/catch wraps the SDK call; SDK's own `{error}` branch handled.
- [x] API contracts — `NewsletterResult` unchanged, caller (`route.ts`) compatible.
- [x] Backwards compat — env vars renamed but `.env.local.example` + `deployment.md` document it; ops note in changelog covers Vercel cleanup.
- [x] Input validation — Zod at route boundary; HTML-escaped at email body boundary.
- [x] Auth/authz — N/A (public endpoint, rate-limited + honeypot).
- [x] N+1 / efficiency — single SDK call per request.
- [x] Data leaks — no PII in logs beyond `error.name`+`error.message`; subscriber email not echoed back to client.
- [x] Resend SDK shape — `resend.emails.send(payload): Promise<CreateEmailResponse>` confirmed; `CreateEmailResponse = {data, error: null} | {data: null, error: ErrorResponse}`. Destructure of `{error}` is correct.

## Positives
- HTML-escape function covers the five XSS-relevant chars (`& < > " '`).
- Separate `text` + `html` bodies — good email client compatibility.
- Misconfig fails closed with user-safe error message ("not configured / try again later") — doesn't leak which env var is missing.
- Stub-mode preserved untouched; dev DX intact.
- Changelog entry is thorough and ops-actionable.

## Recommended Actions (in order)
1. Update `docs/codebase-overview.md` — swap 5 ConvertKit mentions → Resend.
2. Fix `lib/newsletter/stub-source.ts:5` JSDoc comment.
3. (Optional, M1) Static subject line: `subject: "New ScoutPaw subscriber"`.
4. (Optional, M3) `tag: z.string().max(64).optional()` in `schemas.ts`.

## Unresolved Questions
- Should the misconfig path log `RESEND_API_KEY missing` vs `TEAM_NOTIFICATION_EMAIL missing` separately, or is single combined log intentional for ops triage?
- Do you want a `replyTo` set so the team can reply directly to the *new subscriber* from the notification email? Currently the team would reply to `onboarding@resend.dev` (or your verified domain), not the subscriber.

**Concerns/Blockers:** None blocking. H1 cleanup recommended before tagging the migration "complete" since `codebase-overview.md` is LLM-context food.
