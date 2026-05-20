---
phase: 3
title: Cleanup and docs
status: completed
priority: P2
effort: 15m
dependencies:
  - 2
---

# Phase 3: Cleanup and docs

## Overview

Delete obsolete ConvertKit source file and refresh `docs/deployment.md` env var table so the deployment doc matches reality.

## Requirements

- Functional: no dangling references to `convertkit-source` or `CONVERTKIT_*`
- Non-functional: deployment doc smoke-test reflects Resend flow

## Related Code Files

- Delete: `lib/newsletter/convertkit-source.ts`
- Modify: `docs/deployment.md` (env var table + post-deploy smoke test)
- Optional: `docs/project-changelog.md` — add entry per documentation rules

## Implementation Steps

1. **Delete ConvertKit source:**
   ```bash
   rm lib/newsletter/convertkit-source.ts
   ```

2. **Grep-verify no other references remain:**
   ```bash
   # Should return zero matches
   ```
   Search codebase for `convertkit`, `CONVERTKIT_API_KEY`, `CONVERTKIT_FORM_ID`. If matches found in non-plan files, fix them.

3. **Update `docs/deployment.md` env var table** — in the table under "Set production environment variables", replace:
   ```
   | `NEWSLETTER_MODE` | `stub` (until ConvertKit ready → `live`) | All |
   | `CONVERTKIT_API_KEY` | (empty for now) | All |
   | `CONVERTKIT_FORM_ID` | (empty for now) | All |
   ```
   With:
   ```
   | `NEWSLETTER_MODE` | `stub` (until Resend ready → `live`) | All |
   | `RESEND_API_KEY` | `re_xxx` from resend.com/api-keys | Production |
   | `TEAM_NOTIFICATION_EMAIL` | team inbox (e.g., team@scoutpaw.tv) | Production |
   | `NEWSLETTER_FROM_EMAIL` | `onboarding@resend.dev` initially | Production |
   ```

4. **Update smoke-test bullet** — find:
   ```
   - [ ] Submit newsletter form — success message (server logs payload via stub mode)
   ```
   Adjust to mention Resend mode behavior:
   ```
   - [ ] Submit newsletter form — success message
         - stub mode → check Vercel function logs for `[newsletter:stub]`
         - live mode → check team inbox for "New ScoutPaw subscriber: ..." within 5s
   ```

5. **Update `docs/project-changelog.md`** — per documentation rules, append entry:
   ```markdown
   ## 2026-05-18 — Newsletter: switch to Resend
   - **Changed:** Replaced ConvertKit integration with Resend transactional email
   - **Added:** Team notification email on every "Join the Pack" signup
   - **Env vars:** Removed `CONVERTKIT_*`; added `RESEND_API_KEY`, `TEAM_NOTIFICATION_EMAIL`, `NEWSLETTER_FROM_EMAIL`
   ```

## Success Criteria

- [ ] `lib/newsletter/convertkit-source.ts` no longer exists
- [ ] `grep -ri "convertkit" --include="*.ts" --include="*.md" docs/ app/ components/ lib/` returns zero matches (plans/ excluded)
- [ ] `docs/deployment.md` env table lists Resend vars
- [ ] `docs/project-changelog.md` has 2026-05-18 entry
- [ ] `pnpm typecheck` passes

## Risk Assessment

- **Risk:** Deleting `convertkit-source.ts` while still imported elsewhere
  - **Mitigation:** Phase 2 already removed the import. Re-run typecheck after delete.
- **Risk:** Stale env var references in Vercel dashboard
  - **Mitigation:** Out of code scope; ops note in changelog reminds user to clean Vercel env.
