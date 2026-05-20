---
phase: 4
title: Validation
status: completed
priority: P1
effort: 20m
dependencies:
  - 3
---

# Phase 4: Validation

## Overview

Verify the implementation end-to-end: typecheck, lint, stub-mode local test, live-mode integration test. Confirm acceptance criteria from the brainstorm report.

## Requirements

- Functional: form → notification email round-trip works in live mode
- Non-functional: code compiles, lints clean, stub mode still works without Resend key

## Implementation Steps

1. **Static checks:**
   ```bash
   pnpm typecheck
   pnpm lint
   ```
   Both must pass cleanly. Fix any issues before proceeding.

2. **Local stub-mode test (no Resend key required):**
   - `pnpm dev`
   - Navigate to `http://localhost:3000/#newsletter`
   - Submit valid email
   - Confirm: UI shows success state ("You're on the list. Welcome to the pack.")
   - Confirm: dev server console logs `[newsletter:stub] would subscribe: { email, tag }`

3. **Local live-mode test (requires real Resend key + team email):**
   - Add to `.env.local`:
     ```env
     NEWSLETTER_MODE=live
     RESEND_API_KEY=re_xxx
     TEAM_NOTIFICATION_EMAIL=<real address>
     NEWSLETTER_FROM_EMAIL=onboarding@resend.dev
     ```
   - Restart `pnpm dev`
   - Submit form
   - Confirm: UI shows success
   - Confirm: team inbox receives "New ScoutPaw subscriber: ..." within 5s
   - Confirm: email body includes subscriber email, tag, ISO timestamp

4. **Negative tests:**
   - Submit with `NEWSLETTER_MODE=live` but `RESEND_API_KEY` unset → form shows error, server logs nothing sensitive
   - Submit with honeypot filled → form shows success (silent ignore — existing behavior)
   - Submit invalid email → form shows zod error message (existing behavior)
   - Submit 6 times in 60s from same IP → 6th hit returns 429 (existing rate-limit)

5. **Vercel preview deploy** (optional but recommended):
   - Push branch → Vercel preview build
   - Set env vars in preview scope
   - Submit form on preview URL → confirm email delivery

## Success Criteria

- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] Stub mode logs to console without crashing
- [ ] Live mode delivers email to team inbox within 5s
- [ ] Email body contains subscriber email, tag, timestamp, confirmation message
- [ ] Misconfigured env returns clean error (no crash, no PII leak)
- [ ] Rate limit, honeypot, zod validation all still function

## Risk Assessment

- **Risk:** `onboarding@resend.dev` delivers only to Resend-account-owner email
  - **Mitigation:** During testing, ensure `TEAM_NOTIFICATION_EMAIL` matches the Resend account email. Document this in the changelog.
- **Risk:** First production send arrives in spam
  - **Mitigation:** Test once → if spam, plan follow-up to verify `scoutpaw.tv` domain in Resend (separate plan).

## Next Steps (Post-Validation)

- Commit changes via `/ck:git` or manual conventional commit
- Deploy to production via Vercel
- Optional follow-up plan: domain verification + sender upgrade to `notifications@scoutpaw.tv`
