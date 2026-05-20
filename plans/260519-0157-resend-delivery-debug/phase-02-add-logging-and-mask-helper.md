---
phase: 2
title: Add logging and mask helper
status: completed
priority: P1
effort: 20m
dependencies:
  - 1
---

# Phase 2: Add logging and mask helper

## Overview

Add `maskEmail` helper and wire structured logging into the newsletter dispatcher + Resend source. Goal: when this fails next time, the failure mode is visible from Vercel function logs, with no PII leaked.

## Requirements

- Functional:
  - `maskEmail("longnn1998@gmail.com")` → `"lon***@gmail.com"`
  - `lib/newsletter/index.ts` emits one `console.info` per request with mode + env-var presence booleans
  - `lib/newsletter/resend-source.ts` emits one `console.info` on success (with Resend message-id + masked recipient) and one `console.error` on every failure path (missing env, Resend error, fetch error)
- Non-functional:
  - No raw subscriber email in logs
  - No API key in logs (ever)
  - Existing API contract unchanged
  - Stub mode untouched

## Architecture

```
[POST /api/newsletter]
  ↓
[subscribe()] in index.ts
  → console.info("[newsletter] dispatch", {mode, hasResendKey, hasTeamEmail})
  ↓
  if live → subscribeResend()
    → console.info on success: {id, toMasked}
    → console.error on each failure path: {reason, name?, message?, toMasked}
```

## Related Code Files

- Create: `lib/newsletter/mask.ts`
- Modify: `lib/newsletter/index.ts`
- Modify: `lib/newsletter/resend-source.ts`

## Implementation Steps

1. **Create `lib/newsletter/mask.ts`:**
   ```typescript
   /**
    * Mask an email for log output: keep first 3 chars of local part + domain.
    * "longnn1998@gmail.com" → "lon***@gmail.com"
    * "ab@x.io"              → "ab***@x.io"   (short locals: keep what we have)
    * Falls back to "***" for malformed input.
    */
   export function maskEmail(email: string | undefined | null): string {
     if (!email || typeof email !== "string") return "***";
     const at = email.indexOf("@");
     if (at < 1) return "***";
     const local = email.slice(0, at);
     const domain = email.slice(at);
     const visible = local.slice(0, Math.min(3, local.length));
     return `${visible}***${domain}`;
   }
   ```

2. **Update `lib/newsletter/index.ts`** — add pre-flight log:
   ```typescript
   export async function subscribe(req: NewsletterRequest): Promise<NewsletterResult> {
     const mode = process.env.NEWSLETTER_MODE ?? "stub";
     console.info("[newsletter] dispatch", {
       mode,
       hasResendKey: !!process.env.RESEND_API_KEY,
       hasTeamEmail: !!process.env.TEAM_NOTIFICATION_EMAIL,
     });
     if (mode === "live") return subscribeResend(req);
     return subscribeStub(req);
   }
   ```

3. **Update `lib/newsletter/resend-source.ts`** — add success log + enrich error logs:

   - Import `maskEmail` from `./mask`
   - On missing env vars: log `[newsletter:resend] config missing` with booleans (no values)
   - On Resend `error` returned: enrich `[newsletter:resend] send error` with `toMasked: maskEmail(to)`
   - On Resend success: destructure `data` from SDK response → log `[newsletter:resend] sent ok` with `id: data?.id`, `toMasked: maskEmail(to)`
   - On catch: log `[newsletter:resend] fetch error` with `err.message` + `toMasked`

4. **Verify** — `pnpm typecheck` after edits.

## Success Criteria

- [ ] `lib/newsletter/mask.ts` exists, exports `maskEmail`
- [ ] Dispatcher logs `[newsletter] dispatch` with mode + booleans
- [ ] Resend success path logs `[newsletter:resend] sent ok` with id + masked recipient
- [ ] All error paths log `toMasked`, never raw `to`
- [ ] `pnpm typecheck` passes
- [ ] No string literal contains an unmasked subscriber email or API key

## Risk Assessment

- **Risk:** `maskEmail` mis-masks malformed input → logs garbage
  - **Mitigation:** Defensive null/string guard; return `"***"` for anything weird
- **Risk:** Resend SDK `data` shape varies across versions → `data?.id` undefined
  - **Mitigation:** Optional chaining; `id` is a debugging aid, not load-bearing
- **Risk:** Verbose logs in low-volume case
  - **Mitigation:** <100 signups/mo → noise negligible

## Security Considerations

- Mask all subscriber email outputs in logs (the email body itself stays unmasked — that's the team notification, not a log)
- API key never logged in any form
- Boolean presence is safe to log
