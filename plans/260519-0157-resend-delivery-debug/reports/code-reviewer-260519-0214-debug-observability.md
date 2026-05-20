# Code Review — Resend Delivery-Debug + Observability

**Reviewer:** code-reviewer
**Date:** 2026-05-19
**Verdict:** SHIP WITH NOTES

## Scope
- NEW `lib/newsletter/mask.ts`, `app/api/newsletter/health/route.ts`
- MOD `lib/newsletter/index.ts`, `lib/newsletter/resend-source.ts`, `.env.local.example`, `docs/deployment.md`, `docs/project-changelog.md`

## Findings

### Critical
None. No auth bypass, no secret leakage, no injection.

### High
**H1 — Secret in query string (`?key=`).** The health endpoint accepts the secret via URL query, which gets logged by Vercel access logs, browser history, intermediate proxies, and Resend's own request logs. Prefer `Authorization: Bearer <secret>` header. Mitigation: secret is 128-bit, rotateable, and easy to disable via unset. Acceptable for short-lived diagnostic use, but document the trade-off and rotate after each debug session.

**H2 — `timingSafeEqual` can throw on byte-length mismatch.** `route.ts:48` checks `a.length !== b.length` (UTF-16 code units), then `Buffer.from(a)` produces UTF-8 bytes. For an ASCII secret these match, but a non-ASCII `provided` value of equal `.length` but different byte count would throw at line 51, returning an unhandled 500. Not exploitable, but fix is one line: compare buffer lengths instead. Suggested:
```ts
const bufA = Buffer.from(a);
const bufB = Buffer.from(b);
if (bufA.length !== bufB.length) return false;
return timingSafeEqual(bufA, bufB);
```

### Medium
**M1 — `maskEmail` leaks the full local part for short addresses.** `"ab@x.io"` returns `"ab***@x.io"` — entire local visible. For 1–2 char locals this defeats the purpose. Suggest clamping `visible` to `Math.min(3, local.length - 1)` and `""` fallback for very short locals, or unconditionally mask if `local.length <= 3`.

**M2 — Inconsistent masking across sources.** `stub-source.ts:8` still logs raw `req.email`. Out of scope for this PR, but flagged: convention says mask everywhere. Cheap follow-up.

**M3 — No rate limit on `/api/newsletter/health`.** Even with 128-bit secret (not brute-forceable), abusive polling could inflate Vercel function invocation cost. Reuse `rate-limit.ts` or add a per-IP cap.

### Low
**L1 — `error.message` in Resend send-error log.** Resend SDK errors may embed the recipient address in the message string. Currently mitigated since recipient is the (non-PII) team inbox, not the subscriber. Fine.

**L2 — `fromEmail` returned in clear from health endpoint.** Discloses sender infra (Resend default vs verified domain). Not sensitive; intentional for debugging. OK.

**L3 — Subject header `"New ScoutPaw subscriber: ${req.email}"` contains raw subscriber email.** Intentional (it's the team-notification payload), but worth noting: subjects appear in mailbox previews, push notifications, and any future email-archive integrations. Not a bug; acknowledge.

## Verified
- No real `RESEND_API_KEY` ever in git history (`git log -S "re_"` clean on `.env.local.example`); the changelog's git-scrub follow-up concern is unnecessary.
- Fail-closed 404 when `DIAGNOSTIC_SECRET` unset: correct.
- `escapeHtml` applied to user-controlled `email`/`tag` fields in HTML body: correct.
- Honeypot path bypasses subscribe entirely (no dispatch log on bot traffic): good.
- `runtime = "nodejs"` set on health route (required for `node:crypto`): correct.

## Unresolved Questions
1. Should the diagnostic endpoint require `Authorization` header instead of `?key=` query? (Recommend yes for next iteration; ship current form for immediate debug need.)
2. Is `stub-source.ts` raw-email log acceptable in dev-only context, or should it be masked for consistency?
3. After debug session, will `DIAGNOSTIC_SECRET` be rotated or unset? Add operational note.

---

**Status:** DONE_WITH_CONCERNS
**Summary:** Implementation is functionally correct and secure for its stated purpose. Two non-blocking concerns (secret in query string, `timingSafeEqual` byte-vs-char edge case) warrant a follow-up but do not block shipping the debug observability.
**Concerns/Blockers:** H1 secret-in-query is the most material; H2 is a one-line hardening. Both can ship-then-fix.
