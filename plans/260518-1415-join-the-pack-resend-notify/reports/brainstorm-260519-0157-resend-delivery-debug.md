# Brainstorm — Resend Delivery Debug + Observability Hardening

**Date:** 2026-05-19 01:57 (Asia/Saigon)
**Branch:** main
**Context:** Follow-up to brainstorm-260518-1415 (ConvertKit → Resend migration). Notifications not arriving despite all config appearing correct.

---

## Problem Statement

User configured `NEWSLETTER_MODE=live`, `RESEND_API_KEY=...`, `TEAM_NOTIFICATION_EMAIL=longnn1998@gmail.com`, `NEWSLETTER_FROM_EMAIL=onboarding@resend.dev` on Vercel production. Form submits successfully (UI shows "You're on the list"). But:
- Gmail inbox empty
- Gmail spam empty
- **Resend Logs dashboard shows zero send attempts**

→ Resend API never called from production runtime.

## Secondary Issue Discovered

`.env.local.example` (committed git file) contained a **real production API key**. User rotated the key. Sanitization of the example file is still pending.

---

## Diagnostic Conclusions

Given form returns success + Resend Logs is empty + recent deploy supposedly has `NEWSLETTER_MODE=live`:

**Most-likely root cause hierarchy:**

1. **Vercel env vars not in active runtime** — scope mismatch (Preview only, not Production), missed redeploy, or typo. Code falls through `mode === "live"` check → routes to stub → logs to function output, returns ok.
2. **Env vars present but `NEWSLETTER_MODE` value typo** — `live ` (trailing space), `Live` (case sensitive in our code), or empty. Same effect as #1.
3. **Route is hit, mode is "live", but missing `RESEND_API_KEY`/`TEAM_NOTIFICATION_EMAIL` triggers fail-closed early return** — should show form error, but UI may not be showing it correctly (lower probability since user reports success state).

**Less-likely (not ruled out):**

4. Resend SDK swallowed an exception that wasn't caught (unlikely — we have try/catch and `error` destructure both)
5. Form isn't actually hitting `/api/newsletter` (would've been a stub-mode issue too; very unlikely)

---

## Decisions Locked (User-Confirmed)

| Decision | Value |
|---|---|
| Scope | Logging **and** health endpoint |
| Approach | Diagnose first via health endpoint, then harden |
| API key | Already rotated by user |
| `.env.local.example` cleanup | Required (still has key value) |

---

## Approaches Evaluated

### A. Logging + Health Endpoint — **CHOSEN**

- Add structured `console.info` on every dispatch + every Resend send (success and failure)
- Add `GET /api/newsletter/health?key=$DIAGNOSTIC_SECRET` returning the runtime config snapshot
- Sanitize `.env.local.example`
- Mask PII in logs (last 3 chars + domain only)
- **Pros:** Surfaces root cause immediately + protects against future silent failures. ~40 LOC.
- **Cons:** Adds a tiny attack surface (the health endpoint). Mitigated by secret-key guard.

### B. Logging only

- Just add `console.info` on success/failure paths.
- **Pros:** Smaller surface area.
- **Cons:** Requires user to dig through Vercel function logs per failure. Doesn't expose env-var state at a glance — the actual root cause this time.
- **Rejected:** wouldn't have caught today's issue any faster.

### C. Replace `onboarding@resend.dev` with verified domain now

- Skip diagnosis, go straight to domain verification.
- **Pros:** Eliminates sender-reputation risk permanently.
- **Cons:** Doesn't address root cause (env vars not loading). Domain verification takes ~30 min DNS round-trip. Premature.
- **Rejected:** orthogonal to the actual bug.

---

## Final Recommended Solution

**Logging + Health Endpoint** (Approach A), structured as a small follow-up plan to the original Resend migration.

### File Changes

| Path | Action | Purpose |
|---|---|---|
| `.env.local.example` | sanitize | Remove leaked API key; restore blank values; add `DIAGNOSTIC_SECRET` placeholder |
| `lib/newsletter/index.ts` | extend | Pre-flight `console.info` logging dispatcher decision + masked config |
| `lib/newsletter/resend-source.ts` | extend | `console.info` on success with Resend message-id; richer error logs |
| `app/api/newsletter/health/route.ts` | **new** | Secret-guarded GET returning config snapshot |
| `lib/newsletter/mask.ts` | **new** | Tiny helper: `maskEmail("longnn1998@gmail.com") → "lon***@gmail.com"` |
| `docs/deployment.md` | minor | Add diagnostic-endpoint section + redeploy reminder |

### Health Endpoint Contract

```
GET /api/newsletter/health?key=$DIAGNOSTIC_SECRET

200 OK
{
  "mode": "live" | "stub",
  "hasResendKey": true,
  "hasTeamEmail": true,
  "hasFromEmail": true,
  "fromEmail": "onboarding@resend.dev",          // safe, not secret
  "teamEmailMasked": "lon***@gmail.com",         // PII masked
  "nodeEnv": "production",
  "diagnosticTimestamp": "2026-05-19T01:57:00Z"
}

401 Unauthorized   // missing/wrong key
```

### Logging Format

```ts
// On dispatch in index.ts:
console.info("[newsletter] dispatch", {
  mode,
  hasResendKey: !!process.env.RESEND_API_KEY,
  hasTeamEmail: !!process.env.TEAM_NOTIFICATION_EMAIL,
});

// On Resend success in resend-source.ts:
console.info("[newsletter:resend] sent ok", {
  id: data?.id,
  toMasked: maskEmail(to),
});

// On Resend failure (existing, slightly enriched):
console.error("[newsletter:resend] send error", {
  name: error.name,
  message: error.message,
  toMasked: maskEmail(to),
});
```

PII masking is structural, not optional — we never want raw subscriber emails in long-lived log aggregators.

### `.env.local.example` Sanitization

```env
# Newsletter mode — "stub" (MVP, logs to console) or "live" (Resend)
NEWSLETTER_MODE=stub

# Resend API — get key at https://resend.com/api-keys
RESEND_API_KEY=

# Where team notifications land when a user subscribes
TEAM_NOTIFICATION_EMAIL=

# Sender address — onboarding@resend.dev for zero-DNS testing,
# or a verified domain address (e.g., notifications@scoutpaw.tv) in prod
NEWSLETTER_FROM_EMAIL=onboarding@resend.dev

# Random secret for /api/newsletter/health diagnostic endpoint.
# Generate: openssl rand -hex 16
DIAGNOSTIC_SECRET=
```

---

## Implementation Considerations & Risks

| Risk | Mitigation |
|---|---|
| Health endpoint leaks env structure | Secret-key guard; constant-time compare; returns 401 not 403/404 to avoid enumeration |
| `DIAGNOSTIC_SECRET` missing → endpoint open | Treat missing secret as "endpoint disabled" → returns 404. Fail-closed default. |
| Logged Resend message-id traceable to subscriber | Acceptable — id is opaque, only meaningful inside Resend dashboard which user controls |
| Leaked key history in git | User must `git rm --cached .env.local.example` history scrub if already pushed. Out of code scope — flag in changelog. |
| Sanitization removes user's working config | `.env.local.example` is a TEMPLATE — user's working config should live in `.env.local` (gitignored). If user was actually editing `.env.local.example` as their runtime, this needs explanation. |

---

## Diagnostic Flow (After Deploy)

1. Deploy → hit `https://<vercel-url>/api/newsletter/health?key=<DIAGNOSTIC_SECRET>`
2. Inspect response:
   - `mode: "stub"` → root cause is **NEWSLETTER_MODE not set in production env**. Fix in Vercel dashboard, redeploy.
   - `hasResendKey: false` → root cause is **RESEND_API_KEY missing in Vercel**. Same fix.
   - `hasTeamEmail: false` → root cause is **TEAM_NOTIFICATION_EMAIL missing**. Same fix.
   - All `true` and mode `live` → submit a real subscribe; check Vercel function logs for new `[newsletter:resend] sent ok` line. Then check Resend dashboard.

---

## Success Metrics

- ✅ Health endpoint exposes env-var presence (boolean only, never values) to authenticated caller
- ✅ Every dispatch produces a structured log line in Vercel function logs
- ✅ Every successful Resend send is logged with message-id
- ✅ `.env.local.example` contains no real secrets
- ✅ Subscriber form submission produces an email in inbox within 30s (after env vars are correct)
- ✅ `pnpm typecheck` + `pnpm lint` pass

---

## Next Steps

1. User confirms approach
2. Create implementation plan via `/ck:plan`
3. Implement via `/ck:cook`
4. Deploy to Vercel
5. Hit health endpoint, identify the actual missing var, fix in Vercel dashboard, redeploy
6. Re-test subscription form, verify email arrival
7. Follow-up plan (optional): verify `scoutpaw.tv` domain → switch sender off `onboarding@resend.dev`

---

## Unresolved Questions

- Should `DIAGNOSTIC_SECRET` rotate periodically, or one-shot for this debug? (Recommend: one-shot; document but don't automate rotation)
- After root cause is found, should the health endpoint stay? (Recommend: keep it — cheap insurance, valuable for future incidents)
- Does user's `.env.local.example` editing suggest they think that's the runtime file? Worth clarifying before implementation to avoid the same confusion next time.
